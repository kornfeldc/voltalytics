export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {

    return (
        <div>
            {/*<div>daypicker</div>*/}
            {children}
        </div>
    )
}
