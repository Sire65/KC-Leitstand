$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Required = @(
  "app/index.html",
  "app/app.js",
  "app/pcap-analyzer.js",
  "app/assets/css/commandcenter-consolidated-v4.3.5.css",
  "app/assets/images/office/leitstand-buero-v1.png",
  "public/index.html",
  "public/app.js",
  "framework/shared/test-workspace-shell-module/MODULE_MANIFEST.json",
  "framework/shared/test-workspace-shell-module/MODULE_RULES.json",
  "framework/shared/test-workspace-shell-module/test-workspace-shell-module.js",
  "public/framework/shared/test-workspace-shell-module/MODULE_MANIFEST.json",
  "public/framework/shared/test-workspace-shell-module/MODULE_RULES.json",
  "public/framework/shared/test-workspace-shell-module/test-workspace-shell-module.js",
  "framework/shared/test-workspace-layout-module/MODULE_MANIFEST.json",
  "framework/shared/test-workspace-layout-module/MODULE_RULES.json",
  "framework/shared/test-workspace-layout-module/test-workspace-layout-module.js",
  "public/framework/shared/test-workspace-layout-module/MODULE_MANIFEST.json",
  "public/framework/shared/test-workspace-layout-module/MODULE_RULES.json",
  "public/framework/shared/test-workspace-layout-module/test-workspace-layout-module.js",
  "framework/shared/performance-visibility-module/performance-visibility-module.js",
  "public/framework/shared/performance-visibility-module/performance-visibility-module.js",
  "architecture/PERFORMANCE_VISIBILITY_CONTRACT_V1.json",
  "tuev/PERFORMANCE_TUEV_CANDIDATE_REQUEST_V1.json",
  "framework/shared/secure-storage-module/secure-storage-module.js",
  "public/framework/shared/secure-storage-module/secure-storage-module.js",
  "framework/shared/supabase-sync-module/supabase-sync-module.js",
  "public/framework/shared/supabase-sync-module/supabase-sync-module.js",
  "architecture/SECURE_STORAGE_SYNC_CONTRACT_V1.json",
  "architecture/SUPABASE_ENCRYPTED_RECORDS_RLS_V1.sql",
  "tuev/SECURE_STORAGE_SUPABASE_CANDIDATE_REQUEST_V1.json",
  "framework/shared/test-card-design-module/test-card-design-module.js",
  "public/framework/shared/test-card-design-module/test-card-design-module.js",
  "architecture/DESIGNCORE_TEST_CARD_THEME_CONTRACT_V1.json",
  "tuev/DESIGNCORE_TEST_CARD_CANDIDATE_REQUEST_V1.json",
  "framework/shared/brain-control-center-module/brain-control-center-module.js",
  "public/framework/shared/brain-control-center-module/brain-control-center-module.js",
  "architecture/BRAIN_CONTROL_KNOWLEDGE_ACTION_CONTRACT_V1.json",
  "docs/v5/PFLICHTENHEFT_BRAIN_STEUERZENTRALE_WISSEN_MASSNAHMEN_V1.md",
  "tuev/BRAIN_CONTROL_CENTER_CANDIDATE_REQUEST_V1.json",
  "framework/shared/brain-knowledge-management-module/brain-knowledge-management-module.js",
  "public/framework/shared/brain-knowledge-management-module/brain-knowledge-management-module.js",
  "architecture/BRAIN_KNOWLEDGE_MANAGEMENT_CONTRACT_V1.json",
  "framework/shared/sensor-catalog-module/sensor-catalog-module.js",
  "public/framework/shared/sensor-catalog-module/sensor-catalog-module.js",
  "architecture/SENSOR_CATALOG_1200_CONTRACT_V1.json",
  "framework/shared/device-discovery-orchestrator-module/device-discovery-orchestrator-module.js",
  "public/framework/shared/device-discovery-orchestrator-module/device-discovery-orchestrator-module.js",
  "architecture/DEVICE_DISCOVERY_DOMAIN_ISOLATION_CONTRACT_V1.json",
  "framework/shared/sensor-package-review-module/sensor-package-review-module.js",
  "public/framework/shared/sensor-package-review-module/sensor-package-review-module.js",
  "architecture/SENSOR_PACKAGE_REVIEW_LOAD_GATE_CONTRACT_V1.json",
  "framework/shared/self-monitoring-module/self-monitoring-module.js",
  "public/framework/shared/self-monitoring-module/self-monitoring-module.js",
  "architecture/SELF_MONITORING_VISUAL_CONTRACT_V1.json",
  "framework/shared/safety-stop-module/safety-stop-module.js",
  "public/framework/shared/safety-stop-module/safety-stop-module.js",
  "framework/shared/brain-inner-visual-module/brain-inner-visual-module.js",
  "public/framework/shared/brain-inner-visual-module/brain-inner-visual-module.js",
  "app/assets/images/brain/digital-brain-core-v1.png",
  "public/assets/images/brain/digital-brain-core-v1.png",
  "architecture/SAFETY_STOP_SELF_LOAD_CONTRACT_V1.json",
  "architecture/BRAIN_INNER_VISUAL_PULSE_CONTRACT_V1.json",
  "architecture/TEST_WORKSPACE_MIGRATION_CONTRACT_V1.json",
  "architecture/TEST_WORKSPACE_LAYOUT_CONTRACT_V1.json",
  "architecture/PRIMARY_WORKSPACE_LIVE_MIGRATION_CONTRACT_V1.json",
  "architecture/CORE_FIRST_NEW_WORKSPACE_POLICY_V1.json",
  "architecture/CORE_LIVE_OVERVIEW_MIGRATION_CONTRACT_V1.json",
  "framework/shared/core-live-overview-module/core-live-overview-module.js",
  "public/framework/shared/core-live-overview-module/core-live-overview-module.js",
  "docs/v5/PFLICHTENHEFT_TESTARBEITSFLAECHEN_V1.md",
  "studio/TEST_WORKSPACE_SHELL_V0_1_0_REGISTRATION.json",
  "probe/Netzwerk_Pruefdienst_V4.ps1",
  "PROJECT_REGISTER.json",
  "QA_V4_3_6.json"
)
$Missing = @()
foreach ($Path in $Required) {
  if (-not (Test-Path (Join-Path $Root $Path))) { $Missing += $Path }
}
if ($Missing.Count -gt 0) { Write-Error ("Fehlende Pflichtdateien: " + ($Missing -join ", ")) }
$Index = Get-Content (Join-Path $Root "app/index.html") -Raw
$App = Get-Content (Join-Path $Root "app/app.js") -Raw
foreach ($Token in @("officeOverlay","officeChairExit","data-office-command","commandcenter-consolidated-v4.3.5.css","backToOffice","ekgCanvas")) {
  if ($Index -notmatch [regex]::Escape($Token) -and $App -notmatch [regex]::Escape($Token)) { Write-Error "Statischer Check fehlgeschlagen: $Token" }
}
if ($Index -match "commandcenter-v4.3.1.css") { Write-Error "Veralteter CSS-Verweis commandcenter-v4.3.1.css gefunden" }
$WorkspaceModule = Get-Content (Join-Path $Root "framework/shared/test-workspace-shell-module/test-workspace-shell-module.js") -Raw
$WorkspacePublicModule = Get-Content (Join-Path $Root "public/framework/shared/test-workspace-shell-module/test-workspace-shell-module.js") -Raw
if ($WorkspaceModule -cne $WorkspacePublicModule) { Write-Error "App/Public-Synchronitaet des TestWorkspaceShell-Moduls verletzt" }
foreach ($Token in @("CORE_FIRST_MIGRATION_CANDIDATE","NEW_UI_CORE_ONLY","DesignCore.create","WindowCore.create","TableCore.create","InteractionCore.create","liveFor","legacySwitch","data-card-power","overview","internet","router","wifi","pc","devices","protocol")) {
  if ($WorkspaceModule -notmatch [regex]::Escape($Token)) { Write-Error "TestWorkspaceShell-Vertrag fehlt: $Token" }
}
if ($WorkspaceModule -match "fetch\s*\(|XMLHttpRequest|probe execution|measurement start") { Write-Error "TestWorkspaceShell darf keine eigene Messausfuehrung enthalten" }
$CoreLive = Get-Content (Join-Path $Root "framework/shared/core-live-overview-module/core-live-overview-module.js") -Raw
$CoreLivePublic = Get-Content (Join-Path $Root "public/framework/shared/core-live-overview-module/core-live-overview-module.js") -Raw
if ($CoreLive -cne $CoreLivePublic) { Write-Error "App/Public-Synchronitaet des CoreLiveOverview-Moduls verletzt" }
foreach ($Token in @("WindowCore.create","testworkspace:before-render","testworkspace:closing","brain-inline-card","#testLive",".lag-panel",".operation-monitor","latency-ball-module","health-ring-module","prefers-reduced-motion")) {
  if ($CoreLive -notmatch [regex]::Escape($Token)) { Write-Error "CoreLiveOverview-Vertrag fehlt: $Token" }
}
if ($CoreLive -match "cloneNode\s*\(") { Write-Error "CoreLiveOverview darf keine laufenden Komponenten duplizieren" }
$WorkspaceLayout = Get-Content (Join-Path $Root "framework/shared/test-workspace-layout-module/test-workspace-layout-module.js") -Raw
$WorkspacePublicLayout = Get-Content (Join-Path $Root "public/framework/shared/test-workspace-layout-module/test-workspace-layout-module.js") -Raw
if ($WorkspaceLayout -cne $WorkspacePublicLayout) { Write-Error "App/Public-Synchronitaet des TestWorkspaceLayout-Moduls verletzt" }
foreach ($Token in @("leitstand.testworkspace.layout.v1","schemaVersion","column","row","widthUnits","heightUnits","collides","ArrowLeft","resetPage")) {
  if ($WorkspaceLayout -notmatch [regex]::Escape($Token)) { Write-Error "TestWorkspaceLayout-Vertrag fehlt: $Token" }
}
if ($WorkspaceLayout -match "fetch\s*\(|XMLHttpRequest") { Write-Error "TestWorkspaceLayout verletzt PREVIEW_ONLY-Grenze" }
$PerformanceGuard = Get-Content (Join-Path $Root "framework/shared/performance-visibility-module/performance-visibility-module.js") -Raw
$PerformanceGuardPublic = Get-Content (Join-Path $Root "public/framework/shared/performance-visibility-module/performance-visibility-module.js") -Raw
if ($PerformanceGuard -cne $PerformanceGuardPublic) { Write-Error "App/Public-Synchronitaet des PerformanceVisibility-Moduls verletzt" }
if ($PerformanceGuard -match "setInterval\s*\(") { Write-Error "PerformanceVisibility darf kein Polling verwenden" }
foreach ($Token in @("visibilitychange","shouldRenderDetail","backgroundAnimationFps","independentCardTimers")) {
  if ($PerformanceGuard -notmatch [regex]::Escape($Token)) { Write-Error "PerformanceVisibility-Vertrag fehlt: $Token" }
}
$SecureStorage = Get-Content (Join-Path $Root "framework/shared/secure-storage-module/secure-storage-module.js") -Raw
$SecureStoragePublic = Get-Content (Join-Path $Root "public/framework/shared/secure-storage-module/secure-storage-module.js") -Raw
if ($SecureStorage -cne $SecureStoragePublic) { Write-Error "App/Public-Synchronitaet des SecureStorage-Moduls verletzt" }
foreach ($Token in @("indexedDB.open","AES-GCM","getRandomValues","extractable:false","MIGRATION_VERIFY_FAILED")) {
  if ($SecureStorage -notmatch [regex]::Escape($Token)) { Write-Error "SecureStorage-Vertrag fehlt: $Token" }
}
if ($WorkspaceLayout -match "localStorage\.setItem") { Write-Error "Neues WorkspaceLayout darf nicht in localStorage schreiben" }
$SupabaseSync = Get-Content (Join-Path $Root "framework/shared/supabase-sync-module/supabase-sync-module.js") -Raw
if ($SupabaseSync -match "service_role|serviceRole") { Write-Error "SupabaseSync darf keinen Service-Role-Schluessel enthalten" }
if ($SupabaseSync -notmatch "encryptedRecord") { Write-Error "SupabaseSync muss verschluesselte Records verwenden" }
$CardDesign = Get-Content (Join-Path $Root "framework/shared/test-card-design-module/test-card-design-module.js") -Raw
$CardDesignPublic = Get-Content (Join-Path $Root "public/framework/shared/test-card-design-module/test-card-design-module.js") -Raw
if ($CardDesign -cne $CardDesignPublic) { Write-Error "App/Public-Synchronitaet des TestCardDesign-Moduls verletzt" }
foreach ($Token in @("DesignCore.create","registerTheme","evaluateContrast","designStatus","designFocus","prefers-reduced-motion")) {
  if ($CardDesign -notmatch [regex]::Escape($Token)) { Write-Error "TestCardDesign-Vertrag fehlt: $Token" }
}
$BrainControl = Get-Content (Join-Path $Root "framework/shared/brain-control-center-module/brain-control-center-module.js") -Raw
$BrainControlPublic = Get-Content (Join-Path $Root "public/framework/shared/brain-control-center-module/brain-control-center-module.js") -Raw
if ($BrainControl -cne $BrainControlPublic) { Write-Error "App/Public-Synchronitaet des BrainControlCenter-Moduls verletzt" }
if ($BrainControl -match "setInterval\s*\(") { Write-Error "BrainControlCenter darf kein Polling verwenden" }
foreach ($Token in @("SystemAssessmentCore","leitstand:brain-coordination","ACTUATOR_BLOCKED","FrameworkSecureStorage","CANDIDATE_SIMULATION_ONLY")) {
  if ($BrainControl -notmatch [regex]::Escape($Token)) { Write-Error "BrainControlCenter-Vertrag fehlt: $Token" }
}
$BrainKnowledge = Get-Content (Join-Path $Root "framework/shared/brain-knowledge-management-module/brain-knowledge-management-module.js") -Raw
$BrainKnowledgePublic = Get-Content (Join-Path $Root "public/framework/shared/brain-knowledge-management-module/brain-knowledge-management-module.js") -Raw
if ($BrainKnowledge -cne $BrainKnowledgePublic) { Write-Error "App/Public-Synchronitaet des BrainKnowledgeManagement-Moduls verletzt" }
if ($BrainKnowledge -match "setInterval\s*\(|localStorage\.") { Write-Error "BrainKnowledgeManagement verletzt Speicher-/Performance-Grenze" }
foreach ($Token in @("TableCore","DRAFT_ONLY","DRAFT_NOT_ACTIVE","FrameworkSecureStorage","LIMIT=100")) {
  if ($BrainKnowledge -notmatch [regex]::Escape($Token)) { Write-Error "BrainKnowledgeManagement-Vertrag fehlt: $Token" }
}
foreach ($Token in @("CRITICAL_MUST_EXCEED_WARNING","runbookSteps","AUTO_SAFE_PLAN","CONFIRM_REQUIRED","ACTUATOR_BLOCKED","verification","approvalLevel")) {
  if ($BrainKnowledge -notmatch [regex]::Escape($Token)) { Write-Error "BrainKnowledgeEditor-Vertrag fehlt: $Token" }
}
$SensorCatalog = Get-Content (Join-Path $Root "framework/shared/sensor-catalog-module/sensor-catalog-module.js") -Raw
$SensorCatalogPublic = Get-Content (Join-Path $Root "public/framework/shared/sensor-catalog-module/sensor-catalog-module.js") -Raw
if ($SensorCatalog -cne $SensorCatalogPublic) { Write-Error "App/Public-Synchronitaet des SensorCatalog-Moduls verletzt" }
if ($SensorCatalog -match "setInterval\s*\(|localStorage\.") { Write-Error "SensorCatalog verletzt Speicher-/Performance-Grenze" }
foreach ($Token in @("CATALOG_ONLY_DISABLED","count:260","count:220","enabled:false","UNBOUND","LIMIT=100","TableCore","FrameworkSecureStorage")) {
  if ($SensorCatalog -notmatch [regex]::Escape($Token)) { Write-Error "SensorCatalog-Vertrag fehlt: $Token" }
}
$DeviceDiscovery = Get-Content (Join-Path $Root "framework/shared/device-discovery-orchestrator-module/device-discovery-orchestrator-module.js") -Raw
$DeviceDiscoveryPublic = Get-Content (Join-Path $Root "public/framework/shared/device-discovery-orchestrator-module/device-discovery-orchestrator-module.js") -Raw
if ($DeviceDiscovery -cne $DeviceDiscoveryPublic) { Write-Error "App/Public-Synchronitaet des DeviceDiscovery-Moduls verletzt" }
if ($DeviceDiscovery -match "setInterval\s*\(|localStorage\.") { Write-Error "DeviceDiscovery verletzt Speicher-/Performance-Grenze" }
foreach ($Token in @("Promise.allSettled","TIMEOUT_MS=4000","STARTUP_SAFE","NICHT_ERKANNT","PC- und lokale Tests laufen weiter","CONFIRM_REQUIRED","automaticActivation:false")) {
  if ($DeviceDiscovery -notmatch [regex]::Escape($Token)) { Write-Error "DeviceDiscovery-Vertrag fehlt: $Token" }
}
$PackageReview = Get-Content (Join-Path $Root "framework/shared/sensor-package-review-module/sensor-package-review-module.js") -Raw
$PackageReviewPublic = Get-Content (Join-Path $Root "public/framework/shared/sensor-package-review-module/sensor-package-review-module.js") -Raw
if ($PackageReview -cne $PackageReviewPublic) { Write-Error "App/Public-Synchronitaet des SensorPackageReview-Moduls verletzt" }
if ($PackageReview -match "setInterval\s*\(|localStorage\.") { Write-Error "SensorPackageReview verletzt Speicher-/Performance-Grenze" }
foreach ($Token in @("ACTIVATION_INTENT_ONLY","BUDGET=30","LOAD_BUDGET_EXCEEDED","PENDING_CAPABILITY_SCHEDULER_TUEV","enabled:false","FrameworkSecureStorage")) {
  if ($PackageReview -notmatch [regex]::Escape($Token)) { Write-Error "SensorPackageReview-Vertrag fehlt: $Token" }
}
$SelfMonitoring = Get-Content (Join-Path $Root "framework/shared/self-monitoring-module/self-monitoring-module.js") -Raw
$SelfMonitoringPublic = Get-Content (Join-Path $Root "public/framework/shared/self-monitoring-module/self-monitoring-module.js") -Raw
if ($SelfMonitoring -cne $SelfMonitoringPublic) { Write-Error "App/Public-Synchronitaet des SelfMonitoring-Moduls verletzt" }
if ($SelfMonitoring -match "setInterval\s*\(|localStorage\.") { Write-Error "SelfMonitoring verletzt Speicher-/Performance-Grenze" }
foreach ($Token in @("BROWSER_METRICS_CANDIDATE","PerformanceObserver","SAMPLE_MS=5000","SAVE_MS=30000","MAX_POINTS=360","self-dial","self-light","sparkline","self-donut","processCpu:false")) {
  if ($SelfMonitoring -notmatch [regex]::Escape($Token)) { Write-Error "SelfMonitoring-Vertrag fehlt: $Token" }
}
$SafetyStop = Get-Content (Join-Path $Root "framework/shared/safety-stop-module/safety-stop-module.js") -Raw
$SafetyStopPublic = Get-Content (Join-Path $Root "public/framework/shared/safety-stop-module/safety-stop-module.js") -Raw
if ($SafetyStop -cne $SafetyStopPublic) { Write-Error "App/Public-Synchronitaet des SafetyStop-Moduls verletzt" }
foreach ($Token in @("STARTUP_PAUSED","EMERGENCY_STOP","SELF_LOAD_ONLY","masterOff","confirm(")) {
  if ($SafetyStop -notmatch [regex]::Escape($Token)) { Write-Error "SafetyStop-Vertrag fehlt: $Token" }
}
$BrainVisual = Get-Content (Join-Path $Root "framework/shared/brain-inner-visual-module/brain-inner-visual-module.js") -Raw
$BrainVisualPublic = Get-Content (Join-Path $Root "public/framework/shared/brain-inner-visual-module/brain-inner-visual-module.js") -Raw
if ($BrainVisual -cne $BrainVisualPublic) { Write-Error "App/Public-Synchronitaet des BrainInnerVisual-Moduls verletzt" }
foreach ($Token in @("digital-brain-core-v1.png","embedded","dataset.level","brain-inner-visual")) {
  if ($BrainVisual -notmatch [regex]::Escape($Token)) { Write-Error "BrainInnerVisual-Vertrag fehlt: $Token" }
}
$StatusCore = Get-Content (Join-Path $Root "app/assets/js/statuscore-3d/statuscore-3d.js") -Raw
foreach ($Token in @("0.5.6-embedded-brain-core","_drawBrainCore","drawImage","_drawSphere(ctx,cx,cy,r,cfg,time)","BRAIN_ASSET")) {
  if ($StatusCore -notmatch [regex]::Escape($Token)) { Write-Error "StatusCore Embedded-Brain-Vertrag fehlt: $Token" }
}
Write-Host "STATIC_CHECK_V4_3_5: PASS"
