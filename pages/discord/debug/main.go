package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
)

var (
	Listen = ":1035"
)

func main() {
	// 移動
	_, file, _, _ := runtime.Caller(0)
	goDir := filepath.Dir(file) + "/"
	os.Chdir(goDir)

	// アクセス先
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("../"))))
	// Web鯖 起動
	log.Println("Http Server Boot")
	err := http.ListenAndServe(Listen, nil)
	if err != nil {
		log.Println("Failed Listen:", err)
		return
	}
}
