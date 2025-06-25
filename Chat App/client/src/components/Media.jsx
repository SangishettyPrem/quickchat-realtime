import { Avatar, Box, Typography } from "@mui/material";
import { ImageBaseURL } from "../config/url";

const Media = ({ SelectedUser }) => {
    return <>
        <Box sx={{ height: '100%', width: '100%', borderLeft: '1px solid rgba(255, 255, 255, 0.3)' }}>
            <Box sx={{ height: "35%", display: 'flex', justifyContent: 'center', alignItems: "center", flexDirection: 'column' }}>
                <Avatar
                    src={`${ImageBaseURL}${SelectedUser?.profile_image}`}
                    alt="Profile"
                    width={150}
                    height={150}
                    style={{
                        borderRadius: '50%',
                        objectFit: 'cover',
                        width: '100px',
                        height: '100px'
                    }}>
                    {!SelectedUser?.profile_image && SelectedUser?.name?.charAt(0)}
                </Avatar>
                <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h6" fontWeight={"bold"}>{SelectedUser?.name}</Typography>
                    <Typography variant="span" fontWeight={"lighter"}>{SelectedUser?.bio}</Typography>
                </Box>
            </Box>
            <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.3)', padding: "5px 10px" }}>
                <Typography variant="span">Media</Typography>
            </Box>
        </Box>
    </>;
};

export default Media;
