package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"fyne.io/systray"
	"golang.org/x/net/websocket"
)

const (
	DiscordRpcPort     = 6463
	DiscordRpcRange    = 10
	DiscordRpcOrigin   = "https://streamkit.discord.com"
	DiscordRpcClientID = "207646673902501888"
)

func main() {
	systray.Run(onReady, onExit)
}

func onExit() {
	log.Println("Exit Process Now")
}

func onReady() {
	// Icon
	icon, _ := os.ReadFile("./icon.ico")
	systray.SetIcon(icon)
	// Soft Name
	name := "Discord Connector"
	systray.SetTitle(name)
	systray.SetTooltip(name)
	// Exit Item
	exitItem()

	// Start Proxy
	http.Handle("/websocket", websocket.Handler(DialDiscordRPC))

	err := http.ListenAndServe(":16463", nil)
	if err != nil {
		log.Println("Listen failed:", err)
	}
}

func exitItem() {
	exit := systray.AddMenuItem("Exit", "Shutdown App")
	exit.Enable()
	go func() {
		<-exit.ClickedCh
		log.Println("Call Exit Call")
		systray.Quit()
		log.Println("Finish Exit Call")
	}()
}

func DialDiscordRPC(ws *websocket.Conn) {
	log.Printf("Dial Information: %s(%s)", ws.LocalAddr().String(), ws.RemoteAddr().String())

	defer func() {
		ws.Close()
	}()

	for tries := 0; ; tries++ {
		conn, err := websocket.Dial(fmt.Sprintf("ws://127.0.0.1:%d/v=1", DiscordRpcPort+(tries%DiscordRpcRange)), "", DiscordRpcOrigin)
		if err != nil {
			log.Println(err)
			continue
		}

		var destroy chan struct{}
		go messageCopy(conn, ws, destroy)
		go messageCopy(ws, conn, destroy)
		<-destroy
		ws.Close()
		conn.Close()
		return
	}
}

func messageCopy(from, to *websocket.Conn, destroy chan<- struct{}) {
	var message string
	for {
		err := websocket.Message.Receive(from, &message)
		if err != nil {
			destroy <- struct{}{}
			return
		}
		err = websocket.Message.Send(to, message)
		if err != nil {
			destroy <- struct{}{}
			return
		}
	}
}