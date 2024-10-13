import React, { useContext, useEffect, useCallback } from "react";

import Editor from "@monaco-editor/react";
import { PostContext } from "../context/PostContext";
import { useLocation, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

export const EditorComp = () => {
  const { code, setCode, setJoinedUsers, selectedLanguage, socket, isConnected } = useContext(PostContext);
  const location = useLocation();
  const params = useParams();

  const options = {
    selectOnLineNumbers: true,
  };

  const handleChange = (value, event) => {
    setCode(value);
  };

  function handleEditorValidation(markers) {
    markers.forEach((marker) => console.log("onValidate:", marker.message));
  }

  const updateJoinedUsers = useCallback((users) => {
    console.log("Updating joined users:", users);
    setJoinedUsers(users);
  }, [setJoinedUsers]);

  useEffect(() => {
    if (!isConnected) return;

    const handleSetup = (data) => {
      console.log('Setup event received:', data);
      updateJoinedUsers(data.users);
    };

    const handleJoined = (data) => {
      console.log('Joined event received:', data);
      updateJoinedUsers(data.users);
      toast.success(`${data.user.name} joined the room`);
    };

    const handleUserLeft = (data) => {
      console.log('User left event received:', data);
      updateJoinedUsers(data.users);
      toast.error(`${data.user.name} left the room`);
    };

    socket.on("setup", handleSetup);
    socket.on("joined", handleJoined);
    socket.on("user_left", handleUserLeft);

    return () => {
      socket.off("setup", handleSetup);
      socket.off("joined", handleJoined);
      socket.off("user_left", handleUserLeft);
    };
  }, [isConnected, socket, updateJoinedUsers]);

  useEffect(() => {
    if (isConnected) {
      const data = {
        uuid: params.id,
        name: location.state,
        code,
      };
      console.log('Emitting new input:', data);
      socket.emit("new input", data);
    }
  }, [code, params.id, location.state, isConnected, socket]);

  useEffect(() => {
    if (!isConnected) return;

    const handleInputReceived = (data) => {
      console.log('Input received:', data);
      setCode(data);
    };

    socket.on("input received", handleInputReceived);

    return () => {
      socket.off("input received", handleInputReceived);
    };
  }, [isConnected, setCode, socket]);

  return (
    <div className="col-span-2">
      <div className="block">
        <Editor
          className="editor"
          width="100%"
          height="76vh"
          language={selectedLanguage?.value || "javascript"}
          theme="vs-dark"
          value={code}
          options={options}
          onChange={handleChange}
          onValidate={handleEditorValidation}
          defaultValue={code}
        />
      </div>
      <Toaster
        position='top-right'
        toastOptions={{
          duration: 2000,
          style: {
            fontSize: 15,
            padding: '15px 12px'
          }
        }}
      />
    </div>
  );
};
