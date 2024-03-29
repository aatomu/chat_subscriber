go clean -cache -testcache

echo Build Win64
GOOS=windows GOARCH=amd64 go build -o ./build/DiscordConnector-Win64.exe -ldflags="-s -w -H=windowsgui" -trimpath .
echo Build Linux64
GOOS=linux GOARCH=amd64 go build -o ./build/DiscordConnector-Linux64.exe -ldflags="-s -w" -trimpath .
echo Build Finish
