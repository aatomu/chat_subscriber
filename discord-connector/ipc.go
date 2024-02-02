package main

import (
	"bytes"
	"encoding/binary"
	"encoding/json"
	"io"
	"net"
)

type IPC struct {
	Conn net.Conn
}

// Check: https://robins.one/notes/discord-rpc-documentation.html
type OPcode int32

const (
	HandShake OPcode = iota
	Frame
	Close
	Ping
	Pong
)

type RpcHandshake struct {
	V        string `json:"v"`
	ClientID string `json:"client_id"`
}

func NewIPC(clientID string, num int) (ipc *IPC, err error) {
	// Dial
	conn, err := dialRPC(num)
	if err != nil {
		return nil, err
	}
	// Sent handshake
	handshake, _ := json.Marshal(RpcHandshake{
		V:        "1",
		ClientID: clientID,
	})
	err = conn.send(HandShake, handshake)
	if err != nil {
		return nil, err
	}

	return conn, nil
}

func (ipc *IPC) send(code OPcode, message []byte) (err error) {
	buf := new(bytes.Buffer)

	err = binary.Write(buf, binary.LittleEndian, code)
	if err != nil {
		return
	}
	err = binary.Write(buf, binary.LittleEndian, int32(len(message)))
	if err != nil {
		return
	}
	buf.Write([]byte(message))

	_, err = ipc.Conn.Write(buf.Bytes())
	if err != nil {
		return
	}

	return nil
}

func (ipc *IPC) read() (body []byte, err error) {
	opcode := make([]byte, 4) // 32bit
	_, err = io.ReadFull(ipc.Conn, opcode)
	if err != nil {
		return
	}
	length := make([]byte, 4) // 32bit
	_, err = io.ReadFull(ipc.Conn, length)
	if err != nil {
		return
	}
	message := make([]byte, binary.LittleEndian.Uint32(length))
	_, err = io.ReadFull(ipc.Conn, message)
	if err != nil {
		return
	}

	return message, nil
}
