'use client'

import { Provider } from "react-redux"
import { store } from "./index"
import React from "react";
import disableDevtool from "disable-devtool";

export default function ReduxProvider({ children }: { children: React.ReactNode }) {

    // React.useEffect(() => {
    //     disableDevtool();
    // }, []);

    return <Provider store={store}>{children}</Provider>
}