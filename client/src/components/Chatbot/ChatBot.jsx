import React, { useState } from "react";
import { BsArrowBarDown } from "react-icons/bs";
import { AiOutlineSend, AiOutlineDelete } from "react-icons/ai";
import toast from "react-hot-toast";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
import './chatbot.css'
import ChatMessage from "./ChatMessage";
import Form from "./Form";




const ChatBot = ({ setIsOpen, isVerified, setIsVerified }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sentEmail, setSentEmail] = useState(false);
  const [chatLog, setChatLog] = useState([]);
  const [input, setInput] = useState("");
  // const dispatch = useDispatch();
  // const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const chatLogNew = [...chatLog, { user: "me", message: `${input}` }];
    setInput("");
    setChatLog(chatLogNew);
    const messages = chatLogNew.map((message) => message.message).join("\n");
    try {
      const response = await fetch("http://localhost:5000/chatbot/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messages,
        }),
      });
      const data = await response.json();
      setChatLog([...chatLogNew, { user: "gpt", message: `${data.message}` }]);
    } catch (error) {
      setChatLog([
        ...chatLogNew,
        { user: "gpt", message: "some error occurred" },
      ]);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    console.log(email);
    if (!email) {
      alert("Enter email ");
    }
   
    const response = await fetch("http://localhost:5000/otp/sendOTP", {
      
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        subject: "Email Verification OTP",
        message: "otp for chatbot verification",
        duration: 5,
      }),
    });
    const data = await response.json();
    if (data.otp) {
      setSentEmail(true);
      toast.success("Successfully sent otp , please check email");
    } else {
      toast.error("Try again");
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch("http://localhost:5000/otp/verifyOTP", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        otp: otp,
      })
    })
    const data = await response.json()
    if (data.valid) {
      toast.success("Successfully verified , wait for while")
      setIsVerified(true)
    } else {
      toast.error('wrong otp!')
      setIsVerified(false)
    }
    setSentEmail(false)
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-header1">
          <BsArrowBarDown
            className="chatbot-icon"
            size={20}
            onClick={() => setIsOpen((isOpen) => !isOpen)}
          />
          {isVerified && (
            <AiOutlineDelete
              className="chatbot-icon"
              size={20}
              onClick={() => setChatLog([])}
            />
          )}
        </div>
        <p>AI Chatbot</p>
      </div>
      <div className="chatbot-chatwindow">
        {!isVerified ? (
          <>
            {!sentEmail ? (
              <form
                onSubmit={handleEmailSubmit}
                className="chatbot-chatwindow-form"
              >
                <Form type={"Email"} value={email} setter={setEmail} />
                <button type="submit">Submit</button>
              </form>
            ) : (
              <form
                onSubmit={handleOTPSubmit}
                className="chatbot-chatwindow-form"
              >
                <Form type={"OTP"} value={otp} setter={setOtp} />
                <button type="submit">Submit</button>
              </form>
            )}
          </>
        ) : (
          chatLog.length === 0 && (
            <span className="chatbot-chatwindow-starter">
              Ask your queries!
            </span>
          )
        )}
        {chatLog.map((message, index) => (
          <ChatMessage message={message} key={index} />
        ))}
      </div>
      <form className="chatbot-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(() => e.target.value)}
          className="chatbot-form"
          placeholder="Enter your doubt..."
          disabled={isVerified ? "" : "disabled"}
        />
        <button
          className="chatbot-button"
          onClick={handleSubmit}
          disabled={isVerified ? "" : "disabled"}
        >
          <AiOutlineSend size={15} />
        </button>
      </form>
    </div>
  );
};

export default ChatBot;