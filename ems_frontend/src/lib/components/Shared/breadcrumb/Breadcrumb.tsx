import React from "react";
import { Box, Typography, Breadcrumbs, type Theme } from "@mui/material";
import { Link } from "react-router-dom";

import { FaCircle as IconCircle } from 'react-icons/fa';

interface BreadCrumbType {
  subtitle?: string;
  items?: any[];
  title: string;
  children?: React.ReactElement;
}

const Breadcrumb = ({ subtitle, items, title }: BreadCrumbType) => (
  <Box
    sx={{
      backgroundColor: "primary.light",
      borderRadius: (theme: Theme) => `${Number(theme.shape.borderRadius) / 4}px`,
      p: "30px 25px 20px",
      marginBottom: "30px",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <Box sx={{ mb: 1 }}>
      <Typography variant="h4">{title}</Typography>
      <Typography
        color="textSecondary"
        variant="h6"
        fontWeight={400}
        sx={{ mt: 0.8, mb: 0 }}
      >
        {subtitle}
      </Typography>
      <Breadcrumbs
        separator={
          <IconCircle
            size="5"
            fill="textSecondary"
            fillOpacity={"0.6"}
            style={{ margin: "0 5px" }}
          />
        }
        sx={{ alignItems: "center", mt: items ? "10px" : "" }}
        aria-label="breadcrumb"
      >
        {items
          ? items.map((item) => (
              <div key={item.title}>
                {item.to ? (
                  <Link to={item.to} style={{ textDecoration: 'none' }}>
                    <Typography color="textSecondary">{item.title}</Typography>
                  </Link>
                ) : (
                  <Typography color="textPrimary">{item.title}</Typography>
                )}
              </div>
            ))
          : ""}
      </Breadcrumbs>
    </Box>
  </Box>
);

export default Breadcrumb;
