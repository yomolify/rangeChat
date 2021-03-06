# rangeChat

[Demo](http://rangechat.herokuapp.com)

This chat-server is an open chat room, and anybody with a unique username can log in and start chatting. I tested the chatting of multiple users by opening the website on multiple tabs (and VMs) and logging into the chat room using a unique username for each instance. Attempt to duplicate a username results in an error to the user. 

Features:
* Option to show recent history of 8 messages (number 8 hardcoded for the sake of a pleasing UI, instead of having a manual control for it on the website).
* Type @user message for sending a private (whisper) message to user.
* Type !user message for sending an urgent (alert popup) message to user; a use-case which could potentially be useful for medical professionals. 
* List of online users is displayed to the right of the chat box. 
* Current user is highlighted in bold.   
* Checks to ensure blank (or just whitespace) usernames and messages are not registered, and appropriate errors are generated. 

Further Improvements (to be done):
* Responsive Design.
* User Authentication.
* Implementing a (live update) scrolling functionality inside the chat window; the chat should move up as newer messages are received, with the most recent messages closest to the message input box. Currently, the chat window just gets larger and larger and the whole webpage is scrolled. 
* Having the option of choosing a relevant chat room amongst a list or the option to create a new one. 
* Possibility of creating private chat rooms with a simple shareable link (similar to https://niltalk.com/)
* Showing date and time of messages alongside, or as an option. 
* Adding <user> is typing...
