"use client";

import { useGSAP } from "@/app/hooks/useGSAP";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Calendar, Clock, ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const blogPosts = [
    {
        title: "Building Scalable React Applications",
        excerpt: "Learn how to structure React applications for scale, covering state management, code splitting, and performance optimization techniques.",
        date: "March 15, 2024",
        readTime: "5 min read",
        category: "React",
        image: "🚀"
    },
    {
        title: "Mastering TypeScript for Modern Web Development",
        excerpt: "A comprehensive guide to TypeScript best practices, advanced types, and how to leverage type safety in large codebases.",
        date: "February 28, 2024",
        readTime: "8 min read",
        category: "TypeScript",
        image: "📘"
    },
    {
        title: "Three.js: Creating Interactive 3D Web Experiences",
        excerpt: "Explore how to integrate Three.js into your web projects, from basic scenes to complex animations and interactions.",
        date: "February 10, 2024",
        readTime: "6 min read",
        category: "Three.js",
        image: "🎨"
    },
    {
        title: "Optimizing Next.js Performance",
        excerpt: "Deep dive into Next.js optimization strategies including image optimization, code splitting, and server-side rendering best practices.",
        date: "January 22, 2024",
        readTime: "7 min read",
        category: "Next.js",
        image: "⚡"
    }
];

export default function Blog() {
    const sectionRef = useGSAP(() => {
        gsap.from(".blog-card", {
            scrollTrigger: {
                trigger: ".blog-section",
                start: "top 80%",
            },
            opacity: 0,
            y: 30,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out"
        });
    }, []);

    return (
        <section ref={sectionRef} className="blog-section max-w-4xl mx-auto px-6 py-20">
            <div className="mb-12">
                <span className="text-sm text-gray-300 uppercase tracking-wider">Blog</span>
                <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-4">Latest Articles</h2>
                <p className="text-gray-400 text-lg">
                    Thoughts, tutorials, and insights on web development, design, and technology.
                </p>
            </div>

            <div className="space-y-12">
                {blogPosts.map((post, index) => (
                    <article key={index} className="blog-card group border-b border-gray-800 pb-12 last:border-b-0 last:pb-0">
                        <div className="mb-4">
                            <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20">
                                {post.category}
                            </span>
                        </div>

                        <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-purple-400 transition-colors">
                            {post.title}
                        </h3>

                        <p className="text-gray-400 mb-6 leading-relaxed">
                            {post.excerpt}
                        </p>

                        <div className="flex items-center gap-6 text-sm text-gray-300 mb-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{post.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{post.readTime}</span>
                            </div>
                        </div>

                        <a 
                            href="#" 
                            aria-label={`Read more about ${post.title}`}
                            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium border-b border-purple-400/30 hover:border-purple-400 pb-1"
                        >
                            Read more
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                        </a>
                    </article>
                ))}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-800">
                <a 
                    href="#" 
                    aria-label="View all blog articles"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                    View All Articles
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
            </div>
        </section>
    );
}

