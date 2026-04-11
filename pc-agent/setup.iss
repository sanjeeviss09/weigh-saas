[Setup]
AppName=LogiRate PC Agent
AppVersion=1.0
DefaultDirName={pf}\LogiRate
DefaultGroupName=LogiRate
OutputDir=Output
OutputBaseFilename=LogiRateSetup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
ArchitecturesInstallIn64BitMode=x64

[Files]
; The actual compiled executable
Source: "dist\agent.exe"; DestDir: "{app}"; Flags: ignoreversion

; The external config file MUST be located next to the LogiRateSetup.exe that the user runs
Source: "{src}\config.json"; DestDir: "{app}"; Flags: external skipifsourcedoesntexist

[Dirs]
Name: "C:\LogiRate\PDFs"; Permissions: users-modify

[Icons]
Name: "{group}\LogiRate PC Agent"; Filename: "{app}\agent.exe"
Name: "{commondesktop}\LogiRate PC Agent"; Filename: "{app}\agent.exe"

[Run]
Filename: "{app}\agent.exe"; Description: "Launch LogiRate Agent Setup"; Flags: nowait postinstall runascurrentuser

[Code]
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    // Could execute additional logic here if needed.
  end;
end;
