import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material";
import { BsFillLockFill } from "react-icons/bs";

import { actions } from "./reducer";
import {
  loadingSelector,
  errorSelector,
  userSelector,
  isAuthenticatedSelector,
} from "./selector";

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector(loadingSelector);
  const error = useSelector(errorSelector);
  const user = useSelector(userSelector);
  const isAuthenticated = useSelector(isAuthenticatedSelector);

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!account || !password) {
      return;
    }

    dispatch(
      actions.fetchAuthLogin({
        account: account,
        password: password,
      })
    );
  };

  // 監聽認證狀態變化，登入成功後自動導航
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  // 清除錯誤訊息
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(actions.clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

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
      <Paper elevation={3} sx={{ padding: 4, minWidth: 400 }}>
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

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          sx={{
            mt: 1,
            width: "100%",
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
            value={account}
            InputProps={{
              style: { color: "black" },
            }}
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(e) => {
              setAccount(e.target.value);
            }}
            disabled={loading}
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
            value={password}
            autoComplete="current-password"
            InputProps={{
              style: { color: "black" },
            }}
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            disabled={loading}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleLogin}
            disabled={loading || !account || !password}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
