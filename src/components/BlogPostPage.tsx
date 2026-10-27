import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'motion/react';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Calendar, 
  Share2, 
  Link2, 
  Check, 
  ArrowRight, 
  Mail 
} from 'lucide-react';
import { Linkedin, Twitter } from './icons/BrandIcons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../contexts/ThemeContext';
import { blogs, BlogPost } from '../data/blogs';

export const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  // Find the current blog post
  const post = blogs.find((b) => b.slug === slug);

  // Scroll Progress Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Scroll to top on load or post transition
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Set page title for SEO
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Quantum Logics Blog`;
    }
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
        <h2 className="text-3xl font-extrabold uppercase tracking-tight mb-4">Post Not Found</h2>
        <p className="text-black/50 dark:text-white/50 mb-8">The article you are looking for does not exist.</p>
        <Link 
          to="/blog" 
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-bold hover:bg-cyan-500 dark:hover:bg-cyan-400 transition-colors"
        >
          Back to Blog
        </Link>
      </div>
    );
  }

  // Find index of current post for pagination
  const currentIndex = blogs.findIndex((b) => b.id === post.id);
  const prevPost = currentIndex > 0 ? blogs[currentIndex - 1] : null;
  const nextPost = currentIndex < blogs.length - 1 ? blogs[currentIndex + 1] : null;

  // Find related articles (same category, excluding current)
  const relatedPosts = blogs
    .filter((b) => b.category === post.category && b.id !== post.id)
    .slice(0, 2);

  // If we don't have enough related posts in the same category, fill with others
  if (relatedPosts.length < 2) {
    const filler = blogs.filter((b) => b.id !== post.id && !relatedPosts.find(r => r.id === b.id)).slice(0, 2 - relatedPosts.length);
    relatedPosts.push(...filler);
  }

  // Handle Share Clicks
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Check out "${post.title}" on the Quantum Logics blog!`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-white dark:bg-black text-black dark:text-white pt-32 pb-24 transition-colors duration-300 relative overflow-hidden"
    >
      {/* Scroll indicator bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-cyan-500 dark:bg-cyan-400 origin-[0%] z-[110]" 
        style={{ scaleX }} 
      />

      {/* Cyber Grid Pattern Background */}
      <div className="absolute inset-0 cyber-grid-light dark:cyber-grid opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Back navigation */}
        <Link 
          to="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/50 dark:text-white/50 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Blog
        </Link>

        {/* Post Metadata Header */}
        <div className="mb-10">
          <span className="px-3.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 inline-block">
            {post.category}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-black dark:text-white mb-8 leading-tight">
            {post.title}
          </h1>

          {/* Author and stats bar */}
          <div className="flex flex-wrap items-center justify-between gap-6 border-b border-black/5 dark:border-white/10 pb-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-black/60 dark:text-white/60">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-black dark:text-white">{post.author}</div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-black/30 dark:text-white/30">Author</div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-black/40 dark:text-white/40">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-semibold">{post.date}</span>
              </div>

              <div className="flex items-center gap-2 text-black/40 dark:text-white/40">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-semibold">{post.readingTime}</span>
              </div>
            </div>

            {/* Social sharing widget */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShareTwitter}
                className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-cyan-500/10 hover:text-cyan-500 transition-all border border-transparent hover:border-cyan-500/20"
                title="Share on X"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button 
                onClick={handleShareLinkedIn}
                className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-cyan-500/10 hover:text-cyan-500 transition-all border border-transparent hover:border-cyan-500/20"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </button>
              <button 
                onClick={handleCopyLink}
                className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-cyan-500/10 hover:text-cyan-500 transition-all border border-transparent hover:border-cyan-500/20 relative"
                title="Copy link"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Large Cover Image */}
        <div className="aspect-[21/9] bg-black/5 dark:bg-white/5 rounded-[28px] overflow-hidden mb-16 border border-black/5 dark:border-white/10 shadow-lg">
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Body Content */}
        <div className="w-full prose max-w-none dark:prose-invert">
          {post.content.map((block, idx) => {
            switch (block.type) {
              case 'paragraph':
                return (
                  <p key={idx} className="text-black/70 dark:text-white/70 text-lg leading-relaxed mb-6 font-normal">
                    {block.value}
                  </p>
                );
              
              case 'heading':
                if (block.value.level === 2) {
                  return (
                    <h2 key={idx} className="text-3xl font-bold text-black dark:text-white mt-12 mb-6 tracking-tight uppercase">
                      {block.value.text}
                    </h2>
                  );
                }
                return (
                  <h3 key={idx} className="text-2xl font-bold text-black dark:text-white mt-8 mb-4 tracking-tight uppercase">
                    {block.value.text}
                  </h3>
                );
              
              case 'blockquote':
                return (
                  <blockquote key={idx} className="border-l-4 border-cyan-500 dark:border-cyan-400 pl-6 my-8 italic text-black/60 dark:text-white/60 text-lg bg-cyan-500/[0.02] py-4 pr-4 rounded-r-xl">
                    <p className="mb-2">"{block.value.text}"</p>
                    {block.value.cite && (
                      <cite className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40 block not-italic">
                        — {block.value.cite}
                      </cite>
                    )}
                  </blockquote>
                );
              
              case 'list':
                if (block.value.ordered) {
                  return (
                    <ol key={idx} className="list-decimal pl-6 my-6 space-y-3 text-black/70 dark:text-white/70 text-base">
                      {block.value.items.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ol>
                  );
                }
                return (
                  <ul key={idx} className="list-disc pl-6 my-6 space-y-3 text-black/70 dark:text-white/70 text-base">
                    {block.value.items.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                );
              
              case 'code':
                return (
                  <div key={idx} className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden my-8 shadow-inner">
                    <div className="flex items-center justify-between px-4 py-2 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10">
                      <span className="text-[10px] font-mono text-black/40 dark:text-white/40 uppercase tracking-widest">
                        {block.value.language}
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(block.value.code);
                        }}
                        className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 hover:opacity-80 transition-opacity"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <SyntaxHighlighter
                        language={block.value.language === 'quantum' ? 'javascript' : block.value.language}
                        style={theme === 'dark' ? atomDark : undefined}
                        customStyle={{ background: 'transparent', padding: 0, fontSize: '14px', lineHeight: '1.6' }}
                      >
                        {block.value.code}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                );
              
              case 'table':
                return (
                  <div key={idx} className="my-8 overflow-x-auto border border-black/10 dark:border-white/10 rounded-2xl shadow-sm">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10">
                          {block.value.headers.map((header: string, i: number) => (
                            <th key={i} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/60">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/10">
                        {block.value.rows.map((row: string[], rIdx: number) => (
                          <tr key={rIdx} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                            {row.map((cell: string, cIdx: number) => (
                              <td key={cIdx} className="px-6 py-4 text-sm text-black/70 dark:text-white/70">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              
              default:
                return null;
            }
          })}
        </div>

        {/* Share Section Bottom */}
        <div className="w-full border-t border-b border-black/5 dark:border-white/10 py-8 my-16 flex items-center justify-between gap-6">
          <span className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40">
            Share this Article:
          </span>
          <div className="flex gap-3">
            <button 
              onClick={handleShareTwitter}
              className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-cyan-500/10 hover:text-cyan-500 border border-transparent hover:border-cyan-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <Twitter className="w-3.5 h-3.5" /> Twitter
            </button>
            <button 
              onClick={handleShareLinkedIn}
              className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-cyan-500/10 hover:text-cyan-500 border border-transparent hover:border-cyan-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <Linkedin className="w-3.5 h-3.5" /> LinkedIn
            </button>
          </div>
        </div>

        {/* Pagination Links */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 mb-20">
          {prevPost ? (
            <Link 
              to={`/blog/${prevPost.slug}`}
              className="p-6 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/10 rounded-[22px] hover:-translate-y-1 hover:border-cyan-500/30 transition-all duration-300 group text-left flex flex-col justify-between"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/30 mb-2 block">
                ← Previous Article
              </span>
              <span className="font-bold text-black dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                {prevPost.title}
              </span>
            </Link>
          ) : (
            <div className="p-6 border border-dashed border-black/5 dark:border-white/5 rounded-[22px] text-center text-black/20 dark:text-white/20 font-bold text-xs uppercase tracking-widest py-10 flex items-center justify-center">
              First Post
            </div>
          )}

          {nextPost ? (
            <Link 
              to={`/blog/${nextPost.slug}`}
              className="p-6 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/10 rounded-[22px] hover:-translate-y-1 hover:border-cyan-500/30 transition-all duration-300 group text-right flex flex-col justify-between"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/30 mb-2 block">
                Next Article →
              </span>
              <span className="font-bold text-black dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                {nextPost.title}
              </span>
            </Link>
          ) : (
            <div className="p-6 border border-dashed border-black/5 dark:border-white/5 rounded-[22px] text-center text-black/20 dark:text-white/20 font-bold text-xs uppercase tracking-widest py-10 flex items-center justify-center">
              Last Post
            </div>
          )}
        </div>

        {/* Newsletter Subscription Form */}
        <div className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-[28px] p-8 md:p-12 mb-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          <Mail className="w-8 h-8 mx-auto mb-6 text-cyan-600 dark:text-cyan-400" />
          <h3 className="text-2xl font-bold uppercase tracking-tight text-black dark:text-white mb-3">
            Subscribe to the newsletter
          </h3>
          <p className="text-black/50 dark:text-white/50 text-sm max-w-md mx-auto mb-8">
            Get technical insights, announcements, and tutorials straight to your inbox.
          </p>
          <form 
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input 
              type="email" 
              placeholder="Enter your email address"
              required
              className="flex-1 bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-full px-5 py-3 text-sm outline-none focus:border-cyan-500/50"
            />
            <button 
              type="submit"
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-cyan-500 dark:hover:bg-cyan-400 font-bold px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              Subscribe <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Related Articles Title */}
        <div className="border-t border-black/5 dark:border-white/10 pt-16 mb-12">
          <h3 className="text-2xl font-bold uppercase tracking-tight text-black dark:text-white">
            Related Articles
          </h3>
        </div>

        {/* Related Articles Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-20">
          {relatedPosts.map((relatedPost) => (
            <Link 
              key={relatedPost.id}
              to={`/blog/${relatedPost.slug}`}
              className="group block bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/10 rounded-[24px] p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-cyan-500/20 transition-all duration-300"
            >
              <div className="aspect-[21/10] rounded-xl overflow-hidden mb-4 bg-black/5 dark:bg-white/5">
                <img 
                  src={relatedPost.coverImage} 
                  alt={relatedPost.title} 
                  className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-2 inline-block">
                {relatedPost.category}
              </span>
              <h4 className="font-bold text-black dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors leading-tight text-lg mb-2">
                {relatedPost.title}
              </h4>
              <p className="text-black/50 dark:text-white/50 text-xs line-clamp-2 leading-relaxed">
                {relatedPost.excerpt}
              </p>
            </Link>
          ))}
        </div>

        {/* Back to all blogs bottom button */}
        <div className="text-center">
          <Link 
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-6 py-3 border border-black/5 dark:border-white/10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to all articles
          </Link>
        </div>

      </div>
    </motion.div>
  );
};
