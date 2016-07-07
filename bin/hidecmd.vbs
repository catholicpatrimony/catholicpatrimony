Set oShell = CreateObject ("Wscript.Shell") 
Dim strArgs
strArgs = "cmd /c G:\dev\course2web\bin\restart_google_drive.bat"
oShell.Run strArgs, 0, false
