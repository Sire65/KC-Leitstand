$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$SourceRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..')).TrimEnd('\')
$Version = '5.3.1'
$DefaultTarget = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'Netzwerk-Leitstand-V4'

[System.Windows.Forms.Application]::EnableVisualStyles()
$form = New-Object System.Windows.Forms.Form
$form.Text = "Netzwerk-Leitstand V$Version - Installation"
$form.StartPosition = 'CenterScreen'
$form.Size = New-Object System.Drawing.Size(760, 465)
$form.MinimumSize = New-Object System.Drawing.Size(760, 465)
$form.MaximizeBox = $false
$form.Font = New-Object System.Drawing.Font('Segoe UI', 10)

$title = New-Object System.Windows.Forms.Label
$title.Text = 'Netzwerk-Leitstand installieren'
$title.Font = New-Object System.Drawing.Font('Segoe UI Semibold', 16)
$title.AutoSize = $true
$title.Location = New-Object System.Drawing.Point(24, 20)
$form.Controls.Add($title)

$subtitle = New-Object System.Windows.Forms.Label
$subtitle.Text = 'Waehlen Sie Laufwerk und Installationsordner ueber die Windows-Ordnerstruktur aus.'
$subtitle.AutoSize = $true
$subtitle.Location = New-Object System.Drawing.Point(27, 58)
$form.Controls.Add($subtitle)

$targetLabel = New-Object System.Windows.Forms.Label
$targetLabel.Text = 'Installationsordner:'
$targetLabel.AutoSize = $true
$targetLabel.Location = New-Object System.Drawing.Point(27, 105)
$form.Controls.Add($targetLabel)

$targetBox = New-Object System.Windows.Forms.TextBox
$targetBox.Location = New-Object System.Drawing.Point(30, 130)
$targetBox.Size = New-Object System.Drawing.Size(565, 30)
$targetBox.Text = $DefaultTarget
$form.Controls.Add($targetBox)

$browseButton = New-Object System.Windows.Forms.Button
$browseButton.Text = 'Durchsuchen...'
$browseButton.Location = New-Object System.Drawing.Point(610, 127)
$browseButton.Size = New-Object System.Drawing.Size(110, 34)
$form.Controls.Add($browseButton)

$status = New-Object System.Windows.Forms.Label
$status.Text = 'Bereit.'
$status.Location = New-Object System.Drawing.Point(30, 178)
$status.Size = New-Object System.Drawing.Size(690, 24)
$form.Controls.Add($status)

$progress = New-Object System.Windows.Forms.ProgressBar
$progress.Location = New-Object System.Drawing.Point(30, 206)
$progress.Size = New-Object System.Drawing.Size(690, 27)
$progress.Minimum = 0
$progress.Maximum = 100
$form.Controls.Add($progress)

$details = New-Object System.Windows.Forms.TextBox
$details.Location = New-Object System.Drawing.Point(30, 248)
$details.Size = New-Object System.Drawing.Size(690, 105)
$details.Multiline = $true
$details.ReadOnly = $true
$details.ScrollBars = 'Vertical'
$details.BackColor = [System.Drawing.Color]::White
$form.Controls.Add($details)

$installButton = New-Object System.Windows.Forms.Button
$installButton.Text = 'Installieren'
$installButton.Location = New-Object System.Drawing.Point(500, 370)
$installButton.Size = New-Object System.Drawing.Size(105, 38)
$form.Controls.Add($installButton)

$cancelButton = New-Object System.Windows.Forms.Button
$cancelButton.Text = 'Abbrechen'
$cancelButton.Location = New-Object System.Drawing.Point(615, 370)
$cancelButton.Size = New-Object System.Drawing.Size(105, 38)
$form.Controls.Add($cancelButton)

function Update-Ui {
  param([string]$Message, [int]$Percent, [string]$Detail = '')
  $status.Text = $Message
  $progress.Value = [Math]::Max(0, [Math]::Min(100, $Percent))
  if ($Detail) {
    $details.AppendText($Detail + "`r`n")
    $details.SelectionStart = $details.TextLength
    $details.ScrollToCaret()
  }
  [System.Windows.Forms.Application]::DoEvents()
}

function Get-Sha256 {
  param([string]$Path)
  return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Get-CertificateContext {
  param([string]$Root)
  $certPath = Join-Path $Root 'tuev\certificate.json'
  $policyPath = Join-Path $Root 'tuev\policy.json'
  if (!(Test-Path -LiteralPath $certPath -PathType Leaf) -or !(Test-Path -LiteralPath $policyPath -PathType Leaf)) {
    throw 'TUEV-Zertifikat oder TUEV-Policy fehlt.'
  }
  $cert = Get-Content -LiteralPath $certPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $policy = Get-Content -LiteralPath $policyPath -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($cert.status -ne 'VALID') { throw 'Das TUEV-Zertifikat ist nicht gueltig.' }
  return [pscustomobject]@{ Certificate = $cert; Policy = $policy }
}

function Test-CertificateWithProgress {
  param([string]$Root, [int]$StartPercent, [int]$EndPercent, [string]$Phase)
  $ctx = Get-CertificateContext -Root $Root
  $props = @($ctx.Certificate.coveredFiles.psobject.Properties)
  $total = [Math]::Max(1, $props.Count)
  for ($i = 0; $i -lt $props.Count; $i++) {
    $rel = [string]$props[$i].Name
    $expected = ([string]$props[$i].Value).ToLowerInvariant()
    $full = Join-Path $Root ($rel.Replace('/', '\'))
    if (!(Test-Path -LiteralPath $full -PathType Leaf)) { throw "Datei fehlt: $rel" }
    $actual = Get-Sha256 -Path $full
    if ($actual -ne $expected) { throw "Datei veraendert: $rel" }
    $pct = $StartPercent + [Math]::Floor((($i + 1) / $total) * ($EndPercent - $StartPercent))
    if (($i % 3) -eq 0 -or $i -eq ($props.Count - 1)) {
      Update-Ui -Message $Phase -Percent $pct -Detail ("Pruefe {0}/{1}: {2}" -f ($i + 1), $props.Count, $rel)
    }
  }
}

function Get-ProjectItems {
  param([string]$Root)
  $excludeTop = @('diagnose', 'dist', '.git')
  return @(Get-ChildItem -LiteralPath $Root -Recurse -Force | Where-Object {
    $rel = $_.FullName.Substring($Root.Length).TrimStart('\')
    $top = ($rel -split '[\\/]')[0]
    $excludeTop -notcontains $top
  })
}

function Copy-ProjectWithProgress {
  param([string]$Source, [string]$Target, [int]$StartPercent, [int]$EndPercent)
  $items = Get-ProjectItems -Root $Source
  $dirs = @($items | Where-Object { $_.PSIsContainer } | Sort-Object FullName)
  foreach ($dir in $dirs) {
    $rel = $dir.FullName.Substring($Source.Length).TrimStart('\')
    [System.IO.Directory]::CreateDirectory((Join-Path $Target $rel)) | Out-Null
  }
  $files = @($items | Where-Object { !$_.PSIsContainer })
  $total = [Math]::Max(1, $files.Count)
  for ($i = 0; $i -lt $files.Count; $i++) {
    $file = $files[$i]
    $rel = $file.FullName.Substring($Source.Length).TrimStart('\')
    $dest = Join-Path $Target $rel
    $parent = [System.IO.Path]::GetDirectoryName($dest)
    if ($parent) { [System.IO.Directory]::CreateDirectory($parent) | Out-Null }
    [System.IO.File]::Copy($file.FullName, $dest, $true)
    $pct = $StartPercent + [Math]::Floor((($i + 1) / $total) * ($EndPercent - $StartPercent))
    if (($i % 2) -eq 0 -or $i -eq ($files.Count - 1)) {
      Update-Ui -Message 'Programmdateien werden kopiert...' -Percent $pct -Detail ("Kopiere {0}/{1}: {2}" -f ($i + 1), $files.Count, $rel)
    }
  }
}

function Normalize-TargetPath {
  param([string]$Path)
  if ([string]::IsNullOrWhiteSpace($Path)) { throw 'Bitte einen Installationsordner auswaehlen.' }
  $clean = $Path.Trim().Trim('"')
  return [System.IO.Path]::GetFullPath($clean).TrimEnd('\')
}

$browseButton.Add_Click({
  $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
  $dialog.Description = 'Waehlen Sie Laufwerk und Ordner fuer den Netzwerk-Leitstand.'
  $dialog.RootFolder = [Environment+SpecialFolder]::MyComputer
  $dialog.ShowNewFolderButton = $true
  if (Test-Path -LiteralPath $targetBox.Text -PathType Container) { $dialog.SelectedPath = $targetBox.Text }
  if ($dialog.ShowDialog($form) -eq [System.Windows.Forms.DialogResult]::OK) {
    $selected = $dialog.SelectedPath
    if ([string]::IsNullOrWhiteSpace([System.IO.Path]::GetFileName($selected))) {
      $selected = Join-Path $selected 'Netzwerk-Leitstand-V4'
    }
    $targetBox.Text = $selected
  }
  $dialog.Dispose()
})

$cancelButton.Add_Click({ $form.Close() })

$installButton.Add_Click({
  $installButton.Enabled = $false
  $browseButton.Enabled = $false
  $targetBox.Enabled = $false
  $details.Clear()
  try {
    $target = Normalize-TargetPath -Path $targetBox.Text
    $source = [System.IO.Path]::GetFullPath($SourceRoot).TrimEnd('\')
    $targetIsSourceOrChild = $target.Equals($source, [StringComparison]::OrdinalIgnoreCase) -or $target.StartsWith($source + '\', [StringComparison]::OrdinalIgnoreCase)
    $targetIsSourceParent = $source.StartsWith($target + '\', [StringComparison]::OrdinalIgnoreCase)
    if ($targetIsSourceOrChild -or $targetIsSourceParent) {
      [System.Windows.Forms.MessageBox]::Show(
        $form,
        "Dieser Ordner kann nicht verwendet werden, weil sich das laufende Installationspaket darin oder darunter befindet.`r`n`r`nQuelle:`r`n$source`r`n`r`nGewaehltes Ziel:`r`n$target`r`n`r`nBitte waehlen Sie einen anderen Ordner, zum Beispiel L:\Programme\Netzwerk-Leitstand-V4.",
        'Ungeeigneter Installationsordner',
        'OK',
        'Warning'
      ) | Out-Null
      $browseButton.PerformClick()
      return
    }
    Update-Ui -Message 'Quellpaket und TUEV-Zertifikat werden geprueft...' -Percent 1 -Detail ("Quelle: " + $source)
    Test-CertificateWithProgress -Root $source -StartPercent 1 -EndPercent 28 -Phase 'Quellpaket und TUEV-Zertifikat werden geprueft...'
    Update-Ui -Message 'Installationsordner wird vorbereitet...' -Percent 30 -Detail ("Ziel: " + $target)
    if (Test-Path -LiteralPath $target) {
      $answer = [System.Windows.Forms.MessageBox]::Show(
        $form,
        "Der Zielordner existiert bereits:`r`n$target`r`n`r`nJA: vorhandene Installation ersetzen`r`nNEIN: automatisch einen neuen Versionsordner verwenden`r`nABBRECHEN: anderen Ordner waehlen",
        'Installationsordner vorhanden',
        'YesNoCancel',
        'Question'
      )
      if ($answer -eq [System.Windows.Forms.DialogResult]::Cancel) {
        $browseButton.PerformClick()
        return
      }
      if ($answer -eq [System.Windows.Forms.DialogResult]::No) {
        $baseTarget = $target + '-V' + $Version
        $candidate = $baseTarget
        $suffix = 2
        while (Test-Path -LiteralPath $candidate) {
          $candidate = $baseTarget + '-' + $suffix
          $suffix++
        }
        $target = $candidate
        $targetBox.Text = $target
        Update-Ui -Message 'Neuer Versionsordner wurde gewaehlt.' -Percent 31 -Detail ("Neues Ziel: " + $target)
      }
      else {
        try {
          [System.IO.Directory]::Delete($target, $true)
        }
        catch {
          $lockedMessage = "Der vorhandene Zielordner kann nicht ersetzt werden.`r`n`r`nMoegliche Ursache: Der Leitstand oder eine Datei aus diesem Ordner ist noch geoeffnet.`r`n`r`nBitte schliessen Sie den Leitstand und alle Explorer-Fenster dieses Ordners. Danach koennen Sie erneut versuchen oder einen neuen Versionsordner verwenden.`r`n`r`nTechnischer Hinweis:`r`n" + $_.Exception.Message
          $lockedAnswer = [System.Windows.Forms.MessageBox]::Show(
            $form,
            $lockedMessage + "`r`n`r`nJA: erneut versuchen`r`nNEIN: neuen Versionsordner verwenden`r`nABBRECHEN: Installation beenden",
            'Zielordner wird verwendet',
            'YesNoCancel',
            'Warning'
          )
          if ($lockedAnswer -eq [System.Windows.Forms.DialogResult]::Yes) {
            try { [System.IO.Directory]::Delete($target, $true) }
            catch { throw 'Der Zielordner wird weiterhin von einem anderen Prozess verwendet. Bitte den Leitstand und alle zugehoerigen Fenster schliessen oder einen anderen Ordner waehlen.' }
          }
          elseif ($lockedAnswer -eq [System.Windows.Forms.DialogResult]::No) {
            $baseTarget = $target + '-V' + $Version
            $candidate = $baseTarget
            $suffix = 2
            while (Test-Path -LiteralPath $candidate) {
              $candidate = $baseTarget + '-' + $suffix
              $suffix++
            }
            $target = $candidate
            $targetBox.Text = $target
            Update-Ui -Message 'Neuer Versionsordner wurde gewaehlt.' -Percent 31 -Detail ("Neues Ziel: " + $target)
          }
          else { throw 'Installation wurde abgebrochen.' }
        }
      }
    }
    [System.IO.Directory]::CreateDirectory($target) | Out-Null
    Update-Ui -Message 'Installationsordner ist vorbereitet.' -Percent 34
    Copy-ProjectWithProgress -Source $source -Target $target -StartPercent 35 -EndPercent 80
    Update-Ui -Message 'Installierte Kopie wird geprueft...' -Percent 81
    Test-CertificateWithProgress -Root $target -StartPercent 81 -EndPercent 96 -Phase 'Installierte Kopie wird geprueft...'
    Update-Ui -Message 'Desktop-Verknuepfung wird erstellt...' -Percent 97
    $wsh = New-Object -ComObject WScript.Shell
    $shortcut = $wsh.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Desktop')) 'Netzwerk-Leitstand V4.lnk'))
    $shortcut.TargetPath = Join-Path $target 'NETZWERK_LEITSTAND_STARTEN.cmd'
    $shortcut.WorkingDirectory = $target
    $shortcut.Save()
    Update-Ui -Message 'Installation erfolgreich abgeschlossen.' -Percent 100 -Detail ("Installiert nach: " + $target)
    [System.Windows.Forms.MessageBox]::Show($form, "Die Installation wurde erfolgreich abgeschlossen.`r`n`r`n$target", 'Installation abgeschlossen', 'OK', 'Information') | Out-Null
    $startNow = [System.Windows.Forms.MessageBox]::Show($form, 'Soll der Netzwerk-Leitstand jetzt gestartet werden?', 'Jetzt starten?', 'YesNo', 'Question')
    if ($startNow -eq [System.Windows.Forms.DialogResult]::Yes) {
      Start-Process -FilePath (Join-Path $target 'NETZWERK_LEITSTAND_STARTEN.cmd') -WorkingDirectory $target
    }
  }
  catch {
    $message = $_.Exception.Message
    Update-Ui -Message 'Installation fehlgeschlagen.' -Percent 0 -Detail ("FEHLER: " + $message)
    try {
      $logDir = Join-Path $SourceRoot 'diagnose'
      [System.IO.Directory]::CreateDirectory($logDir) | Out-Null
      $logFile = Join-Path $logDir ("Installationsfehler_{0}.txt" -f (Get-Date -Format 'yyyyMMdd_HHmmss'))
      @(
        "Netzwerk-Leitstand V$Version - Installationsfehler",
        "Zeit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
        "Quelle: $SourceRoot",
        "Ziel: $($targetBox.Text)",
        "Fehler: $message"
      ) | Set-Content -LiteralPath $logFile -Encoding UTF8
    } catch { }
    [System.Windows.Forms.MessageBox]::Show($form, $message, 'Installation nicht abgeschlossen', 'OK', 'Error') | Out-Null
  }
  finally {
    $installButton.Enabled = $true
    $browseButton.Enabled = $true
    $targetBox.Enabled = $true
  }
})

[void]$form.ShowDialog()
