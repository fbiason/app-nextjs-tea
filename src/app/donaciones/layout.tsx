import Navbar from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Donaciones",
    description: "",
};

export default function DonacionesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <section className="min-h-screen bg-white">
            <Navbar />
            {children}
        </section>
    );
}
