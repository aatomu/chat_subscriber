//go:build linux && amd64

package main

import (
	"fmt"
	"net"
	"os"
	"path/filepath"
	"time"
)

func getIpcPath() string {
	for _, variableName := range []string{"XDG_RUNTIME_DIR", "TMPDIR", "TMP", "TEMP"} {
		path, exists := os.LookupEnv(variableName)

		if exists {
			return path
		}
	}

	return "/tmp"
}

func dialRPC(num int) (*IPC, error) {
	conn, err := net.DialTimeout("unix", filepath.Join(getIpcPath(), fmt.Sprintf("/discord-ipc-%d", num)), time.Second*2)
	return &IPC{conn}, err
}
