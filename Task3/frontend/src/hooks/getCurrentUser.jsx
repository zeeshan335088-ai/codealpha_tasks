import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFollowing, setUserData } from '../redux/userSlice';
import { serverUrl } from '../App';
import { setCurrentUserStory } from '../redux/storySlice';


const useCurrentUser = () => {
    const dispatch = useDispatch();
    const {storyData}=useSelector(state=>state.story)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true });
                dispatch(setUserData(result.data));
                dispatch(setCurrentUserStory(result.data.story));
            } catch (error) {
                console.log(error.response?.data || error.message || error);
            }
        };

        fetchUser();
    }, [storyData]);
};

export default useCurrentUser;
