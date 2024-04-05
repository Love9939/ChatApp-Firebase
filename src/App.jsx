import { useEffect, useState, useRef } from "react";
import { Box, Button, Container, HStack, Input, VStack } from "@chakra-ui/react";
import Message from "./Components/Message";
import { onAuthStateChanged, getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { app } from "./firebase";
import { getFirestore, addDoc, collection, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";




// Move auth and dataBase initialization to the top level
const auth = getAuth(app);
const dataBase = getFirestore(app);

// Define loginHandler and logOutHandler functions
const loginHandler = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
};

const logOutHandler = () => {
  signOut(auth);
};

// Move the App component declaration to the top level
function App() {
  const [user, setUser] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const divForScroll = useRef(null);

  useEffect(() => {
    const quarrrry = query(collection(dataBase, "Messages"), orderBy("createdAt", "asc"));
    const unSubscribe = onAuthStateChanged(auth, (data) => {
      setUser(data);
    });

    const unsubscribeSnapshot = onSnapshot(
      quarrrry,
      (snap) => {
        setMessages(snap.docs.map((item) => {
          const id = item.id;
          return { id, ...item.data() };
        }));
      }
    );

    return () => {
      unSubscribe();
      unsubscribeSnapshot();
    };

  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      return; // If message is empty, exit the function
    }

    try {
      setMessage("");
      await addDoc(collection(dataBase, "Messages"), {
        text: message,
        uid: user.uid,
        uri: user.photoURL,
        createdAt: serverTimestamp()
      });

      divForScroll.current.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      alert(error);
    }
  };

  return (
    <>
      <Box bg={"red.50"}>
        {user ? (
          <Container bg={"white"} h={"100vh"}>
            <VStack h="full" paddingY={4}>
              <Button onClick={logOutHandler} width={"full"} colorScheme="red">Logout</Button>
              <VStack h="full" w="full" overflowY={"auto"} css={{"&::-webkit-scrollbar": { display: "none" }}}>
                {messages.map(item => (
                  <Message
                    key={item.id}
                    user={item.uid === user.uid ? "me" : "other"}
                    text={item.text}
                    uri={item.uri}
                  />
                ))}
                <div ref={divForScroll}></div>
              </VStack>
              <form onSubmit={submitHandler} style={{ width: "100%" }}>
                <HStack>
                  <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter a Message..." />
                  <Button type="submit" colorScheme="purple">Send</Button>
                </HStack>
              </form>
            </VStack>
          </Container>
        ) : (
          <VStack bg={"white"} justifyContent={"center"} h={"100vh"}>
            <Button colorScheme="purple" onClick={loginHandler}>Sign In With Google</Button>
          </VStack>
        )}
      </Box>
    </>
  );
}

export default App;


