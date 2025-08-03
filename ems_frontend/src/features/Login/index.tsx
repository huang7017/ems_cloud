import React, { useState } from "react";
import { useDispatch } from "react-redux";

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
} from "@mui/material";
import { BsFillLockFill } from "react-icons/bs";

import { actions } from "./reducer";

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary", width: 56, height: 56 }}>
            <BsFillLockFill fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
        </Box>
        <Box
          component="form"
          sx={{
            mt: 1,
            width: "100%", // Fix IE 11 issue.
          }}
          noValidate
        >
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="account"
            label="Account"
            name="Account"
            InputProps={{
              style: { color: 'black' },
            }}
            InputLabelProps={
              {shrink: true}
            }
            onChange={(e) => {
              setAccount(e.target.value);
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            InputProps={{
              style: { color: 'black' },
            }}
            InputLabelProps={
              {shrink: true}
            }
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            onClick={() =>
              dispatch(
                actions.fetchAuthLogin({
                  account: account,
                  password: password,
                })
              )
            }
          >
            Sign In
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
