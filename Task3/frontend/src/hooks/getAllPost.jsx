import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { serverUrl } from '../App';
import { setPostData } from '../redux/postSlice';

const getAllPost
 = () => {
    const dispatch = useDispatch();
    const {userData}=useSelector(state=>state.user) 
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/post/getAll`, { withCredentials: true });
                dispatch(setPostData(result.data));
            } catch (error) {
                console.log(error.response?.data || error.message || error);
            }
        };

        fetchPost()
    }, [userData,dispatch]);
};

export default getAllPost;
