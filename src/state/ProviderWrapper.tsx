"use client";
import { Provider } from "react-redux";
import { store } from "./store";
import React, { ReactElement } from "react";



export default function ProviderWrapper(props:{children: ReactElement}) {

    return (
        <Provider store={store}>
            {props.children}
        </Provider>
    ) 
}