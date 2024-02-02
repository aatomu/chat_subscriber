//go:build windows && amd64

package main

import (
	"fmt"
	"time"

	"github.com/Microsoft/go-winio"
)

func dialRPC(num int) (*IPC, error) {
	t := 2 * time.Second
	conn, err := winio.DialPipe(fmt.Sprintf(`\\.\pipe\discord-ipc-%d`, num), &t)
	return &IPC{conn}, err
}
