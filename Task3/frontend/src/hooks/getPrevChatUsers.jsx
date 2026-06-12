import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFollowing, setUserData } from '../redux/userSlice';
import { serverUrl } from '../App';
import { setCurrentUserStory } from '../redux/storySlice';
import { setPrevChatUsers } from '../redux/messageSlice';


const getPrevChatUsers = () => {
    const dispatch = useDispatch();
    const {messages}=useSelector(state=>state.message)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/message/prevChats`, { withCredentials: true });
                dispatch(setPrevChatUsers(result.data));
            console.log(result.data)
            } catch (error) {
                console.log(error.response?.data || error.message || error);
            }
        };

        fetchUser();
    }, [messages]);
};

export default getPrevChatUsers;
