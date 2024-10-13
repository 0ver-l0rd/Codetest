import React, { useContext, useState, useEffect } from "react";
import { Container } from "../components/Container";
import { EditorComp } from "../components/Editor";
import { Executor } from "../components/Executor";
import { Navbar } from "../components/Navbar";
import { PostContext } from "../context/PostContext";
import { UsersDrawer } from "../components/UsersDrawer";
import { LanguageDropdown } from "../components/LanguageDropdown";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

function Home() {
  const [openSideDrawer, setOpenSideDrawer] = useState(false);
  const { setSelectedLanguage, socket, isConnected } = useContext(PostContext);
  const [theme, setTheme] = useState("cobalt");
  const params = useParams();
  const location = useLocation();

  const onSelectChange = (sl) => {
    console.log("selected Option...", sl);
    setSelectedLanguage(sl);
  };

  useEffect(() => {
    if (isConnected) {
      console.log('Attempting to join room:', params.id);
      socket.emit("join room", {
        uuid: params.id,
        name: location.state,
      });
    } else {
      console.log('Not connected to server. Cannot join room.');
      toast.error("Not connected to the server. Please wait or refresh the page.");
    }
  }, [isConnected, socket, params.id, location.state]);

  return (
    <>
      <Navbar setOpenSideDrawer={setOpenSideDrawer}/>
      <main className="mt-5">
        <Container>
          <div className="flex space-x-3 w-[300px] ">
            <LanguageDropdown onSelectChange={onSelectChange}/>
          </div>
          <div className="grid grid-cols-3 space-x-3 mt-10">
            <EditorComp />
            <Executor />
          </div>
        </Container>
      </main>
      {openSideDrawer &&
        <UsersDrawer setOpenSideDrawer={setOpenSideDrawer}/>
      }
    </>
  );
}

export default Home;
