window.NETZWERK_LEITSTAND_NAVIGATION = {
  schemaVersion: "1.1.0",
  projectId: "NL",
  componentId: "NavigationCore",
  projectIcon: "▦",
  projectIconKey: "network-control-room",
  defaultExpandedGroup: "leitstand",
  maxOpenGroups: 1,
  defaultWidth: 270,
  collapsedWidth: 72,
  userPanel: {
    visible: true,
    displayName: "Hans",
    role: "Administrator",
    showAutomaticMode: true,
    automaticLabelOff: "Auto: aus",
    automaticLabelOn: "Auto: an",
    showOfficeModeStart: true,
    officeStartLabel: "Büromodus starten",
    officeActiveLabel: "Büromodus aktiv"
  },
  groups: [
    {id:"leitstand",label:"Leitstand",items:[
      {id:"dashboard",label:"Dashboard",page:"dashboard",icon:"⌂"},
      {id:"live-diagnose",label:"Live-Diagnose",page:"current",icon:"!"},
      {id:"incidents",label:"Störungen",page:"incidents",icon:"⚠"}]},
    {id:"monitoring",label:"Überwachung",items:[
      {id:"tests",label:"Prüfkreise",page:"tests",icon:"✓"},
      {id:"devices-monitor",label:"Geräteüberwachung",page:"devices",icon:"▦"},
      {id:"wifi",label:"Mesh / WLAN",page:"wifi",icon:"W"},
      {id:"fritz",label:"FRITZ!Box",page:"fritz",icon:"▣"},
      {id:"docsis",label:"DOCSIS",page:"docsis",icon:"D"}]},
    {id:"masterdata",label:"Stammdaten",cssClass:"nav-group-stammdaten",items:[
      {id:"devices-master",label:"Geräte",page:"devices",icon:"▦",sub:true},
      {id:"router-profiles",label:"Routerprofile",page:"settings",settingsPanel:"routerProfiles",icon:"▣",sub:true}]},
    {id:"evaluation",label:"Auswertung",items:[
      {id:"reports",label:"Berichte",page:"reports",icon:"⇩"},
      {id:"measurements",label:"Messprotokoll",page:"measurements",icon:"≡"},
      {id:"pcap",label:"Paketmitschnitt",page:"pcap",icon:"P"}]},
    {id:"system",label:"System",items:[
      {id:"settings",label:"Einstellungen",page:"settings",icon:"⚙"},
      {id:"help",label:"Hilfe",page:"help",icon:"?"}]}
  ]
};
