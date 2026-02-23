import React from "react";
import { Copyright } from "lucide-react";

function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-4 mt-8">
            <div className="container mx-auto flex items-center justify-center gap-2">
                <Copyright className="size-5" />
                <span>
                    {new Date().getFullYear()} All Rights Reserved, Amigo Nexus Technology
                </span>
            </div>
        </footer>
    );
}

export default Footer;
