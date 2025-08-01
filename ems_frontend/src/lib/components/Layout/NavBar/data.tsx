import React from 'react';
import {FaHome,FaAccusoft} from 'react-icons/fa';
import type { SvgIconProps } from "@mui/material";



export type SidebarItem = {
    title: string;
    url?: string;
    icon: React.ReactElement<SvgIconProps> 
    children?: SidebarItem[]
};


type Sidebar = {
    sideBar: SidebarItem[];
};

export const sideData: Sidebar = {
    sideBar: [
        {
            title: "首頁",
            url:"/",
            icon: <FaHome/>
        },
        {
            title: "測試",
            icon: <FaAccusoft/>,
            children:[
                {
                    title: "測試二",
                    url:"/test/test2",
                    icon: <FaHome/>,
                    
                },
            ]
        },
    ]
};