"use client";

import { useGSAP } from "@/app/hooks/useGSAP";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Code2, Coffee, Rocket } from "lucide-react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}
    
export default function About() {
    const sectionRef = useGSAP(() => {
        gsap.from(".about-item", {
            scrollTrigger: {
                trigger: ".about-section",
                start: "top 80%",
            },
            opacity: 0,
            y: 30,
            duration: 0.6,
            stagger: 0.2,
            ease: "power2.out"
        });
    }, []);

    return (
        <section ref={sectionRef} className="about-section max-w-3xl mx-auto px-6 py-20">
            <div className="mb-12">
                <span className="text-sm text-gray-300 uppercase tracking-wider">About</span>
                <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-8">Who I Am</h2>
            </div>
            
            <div className="prose prose-invert max-w-none">
                <div className="about-item space-y-6">
                    <p className="text-lg text-gray-300 leading-relaxed">
                        I'm a Full Stack Developer passionate about building beautiful, functional web applications. 
                        I love turning complex problems into simple, elegant solutions.
                    </p>
                    <p className="text-base text-gray-400 leading-relaxed">
                        With expertise in modern JavaScript frameworks, server-side technologies, and cloud platforms, 
                        I specialize in creating scalable applications that deliver exceptional user experiences. 
                        I'm always eager to learn new technologies and contribute to innovative projects.
                    </p>
                    <p className="text-base text-gray-400 leading-relaxed">
                        My approach to development combines technical excellence with a focus on user experience. 
                        I believe in writing clean, maintainable code and building products that people actually want to use.
                    </p>
                </div>

                <div className="about-item grid md:grid-cols-3 gap-6 mt-12">
                    <div className="p-6 border-l-2 border-purple-500/30 pl-6">
                        <Code2 className="w-6 h-6 text-purple-400 mb-3" />
                        <h3 className="text-lg font-semibold mb-2">Development</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">Building scalable applications with modern technologies</p>
                    </div>
                    <div className="p-6 border-l-2 border-purple-500/30 pl-6">
                        <Coffee className="w-6 h-6 text-purple-400 mb-3" />
                        <h3 className="text-lg font-semibold mb-2">Design</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">Creating intuitive and beautiful user experiences</p>
                    </div>
                    <div className="p-6 border-l-2 border-purple-500/30 pl-6">
                        <Rocket className="w-6 h-6 text-purple-400 mb-3" />
                        <h3 className="text-lg font-semibold mb-2">Innovation</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">Exploring new technologies and best practices</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

