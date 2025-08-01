/** 基础页面结构 - 有头部，有底部，有侧边导航 **/

// ==================
// 所需的各种插件
// ==================

import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

// ==================
// 所需的所有组件
// ==================
import { Box, CircularProgress } from '@mui/material';

// ==================
// 路由组件
// ==================
const Login = React.lazy(() => import('../features/public/Login'));

const NotFound = React.lazy(() => import('./NotFound'));

// 加载组件
const LoadingComponent: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

// 类型定义
interface PublicLayoutProps {
  // 可以根据需要添加更多属性
}

const PublicLayout: React.FC<PublicLayoutProps> = () => {

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Suspense fallback={<LoadingComponent />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Box>
    </Box>
  );
};

export default PublicLayout;
