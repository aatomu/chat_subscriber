package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"fyne.io/systray"
	"golang.org/x/net/websocket"
)

const (
	IpcRange = 10
)

func main() {
	// Logger
	logger, err := os.Create(filepath.Join(os.TempDir(), fmt.Sprintf("Discord-Connector_%s.log", time.Now().Format("20060102-15-04-05"))))
	if err != nil {
		panic(err)
	}
	defer logger.Close()
	log.SetOutput(io.MultiWriter(logger, os.Stdout))
	log.Println("func main()")

	// Generate icon
	// icon, _ := os.ReadFile("./icon.ico")
	// for i, v := range icon {
	// 	if i%32 == 0 {
	// 		fmt.Printf("\n")
	// 	}
	// 	fmt.Printf("0x%02x,", v)
	// }
	// return

	work, _ := os.Executable()
	os.Chdir(filepath.Dir(work))
	log.Println("move to", filepath.Dir(work))
	// Systray start
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
	systray.Quit()
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

	clientID := ws.Request().URL.Query().Get("id")
	for tries := 0; tries < 100; tries++ {
		log.Println("Dial", fmt.Sprintf("discord-ipc-%d", tries%IpcRange))
		ipc, err := NewIPC(clientID, tries%IpcRange)

		if err != nil {
			log.Println("Dial error:", err)
			time.Sleep(1 * time.Second)
			continue
		}

		defer func() {
			ipc.Conn.Close()
		}()

		var isBreak = false
		go func() {
			var message string
			for !isBreak {
				err := websocket.Message.Receive(ws, &message)

				if err != nil {
					if err == io.EOF {
						log.Println("Close Websocket by Client")
					} else {
						log.Println("Read websocket error:", err)
					}
					isBreak = true
					return
				}
				log.Println("Read websocket:", message)

				ipc.send(Frame, []byte(message))
			}
		}()
		for !isBreak {
			res, err := ipc.read()
			if err != nil {
				if err == io.EOF {
					log.Println("Close IPC by Client")
				} else {
					log.Println("Read IPC error:", err)
				}
				isBreak = true
				return
			}
			log.Printf("Read IPC: %+v", res)

			if strings.Contains(res.Message, "AUTHENTICATE") {
				// Set activity
				activity := ReadActivity()
				if len(activity) > 0 {
					ipc.send(Frame, []byte(fmt.Sprintf(`{"nonce":"AUTO_SEND_COMMAND","cmd":"SET_ACTIVITY","evt":null,"args":{"pid":1,"activity":%s}}`, activity)))
				}
			}

			websocket.Message.Send(ws, res.Message)
		}
		return
	}
}

func ReadActivity() (activity string) {
	_, err := os.Stat("activity.json")
	if os.IsNotExist(err) {
		return
	}

	b, _ := os.ReadFile("activity.json")
	activity = string(b)
	activity = strings.Replace(activity, `"$now"`, fmt.Sprintf("%d", time.Now().Unix()), 1)

	return
}
