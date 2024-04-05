import React from 'react'
import {HStack,Avatar,Text} from "@chakra-ui/react"

const Message = ({ text , uri , user = "other" }) => {
  return (
    <HStack alignSelf={user === "me" ? "flex-end" : "flex-start"} borderRadius={"base"} bg="gray.100" paddingX={2} paddingY={user==="me" ? "2" : "4"}>
        {
            user=="other" && <Avatar src={uri}></Avatar>
        }
        
        <Text  > {text} </Text>
        {
            user=="me" && <Avatar src={uri}></Avatar>
        }
        
    </HStack>
  )
}

export default Message