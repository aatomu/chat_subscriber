package main

import (
	"fmt"
	"log"
	"net/http"

	"fyne.io/systray"
	"golang.org/x/net/websocket"
)

const (
	DiscordRpcPort  = 6463
	DiscordRpcRange = 10
	// DiscordRpcOrigin   = "https://streamkit.discord.com"
	// DiscordRpcClientID = "207646673902501888"
	DiscordRpcOrigin   = "https://localhost"
	DiscordRpcClientID = "1201816266344759326"
)

func main() {
	// icon, _ := os.ReadFile("./icon.ico")
	// for i, v := range icon {
	// 	if i%32 == 0 {
	// 		fmt.Printf("\n")
	// 	}
	// 	fmt.Printf("0x%02x,", v)
	// }
	// return
	log.Println("func main()")
	systray.Run(onReady, onExit)
}

func onExit() {
	log.Println("Exit Process Now")
}

func onReady() {
	log.Println("func onReady()")
	// Soft Icon
	systray.SetIcon(icon)
	log.Println("Icon set")
	// Soft Name
	name := "Discord Connector"
	systray.SetTitle(name)
	systray.SetTooltip(name)
	log.Println("Tips set")
	// Exit Item
	go exitItem()

	// Start Proxy
	http.Handle("/websocket", websocket.Handler(DialDiscordRPC))
	log.Println("Handle set")

	log.Println("Http Server Boot")
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
	log.Printf("Dial Information: \"%s\" by \"%s\"", ws.LocalAddr().String(), ws.RemoteAddr().String())

	defer func() {
		ws.Close()
	}()

	for tries := 0; ; tries++ {
		URI := fmt.Sprintf("ws://127.0.0.1:%d/?v=1&client_id=%s", DiscordRpcPort+(tries%DiscordRpcRange), DiscordRpcClientID)
		log.Println("Dial", URI)
		conn, err := websocket.Dial(URI, "", "https://streamkit.discord.com")
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
		log.Println(message)
		err = websocket.Message.Send(to, message)
		if err != nil {
			destroy <- struct{}{}
			return
		}
	}
}
