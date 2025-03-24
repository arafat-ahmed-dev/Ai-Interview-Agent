import React from 'react';

const RootLayout = ({children}:{children : React.ReactNode} ) => {
    return (
        <div className="">
            {children}
        </div>
    );
}

export default RootLayout;