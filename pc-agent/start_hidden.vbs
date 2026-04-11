Set WshShell = CreateObject("WScript.Shell")
' 0 means hide the window completely
' false means do not wait for the script to finish
WshShell.Run "cmd.exe /c cd /d """ & CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) & """ && venv\Scripts\pythonw.exe agent.py", 0, False
