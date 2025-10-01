-- Create articles table
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Articles are publicly readable" 
ON public.articles 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some sample articles
INSERT INTO public.articles (title, slug, excerpt, content, author) VALUES
('Getting Started with AI Development', 'getting-started-ai-development', 'Learn the fundamentals of AI development and how to build your first AI-powered application.', 'Artificial Intelligence is transforming how we build applications. In this article, we explore the fundamental concepts of AI development and provide practical guidance for building your first AI-powered application. From understanding machine learning basics to implementing real-world solutions, this guide will help you start your AI journey.', 'one-next Team'),
('The Future of Web Development', 'future-web-development', 'Explore emerging trends and technologies shaping the future of web development.', 'The web development landscape is constantly evolving. New frameworks, tools, and methodologies emerge regularly, changing how we build digital experiences. In this article, we examine the key trends shaping the future of web development, including serverless architectures, edge computing, and the rise of AI-assisted development tools.', 'one-next Team'),
('Building Scalable Applications', 'building-scalable-applications', 'Best practices and patterns for creating applications that scale with your business.', 'Scalability is crucial for modern applications. This comprehensive guide covers the essential patterns, architectures, and best practices for building applications that can grow with your business needs. Learn about microservices, database optimization, caching strategies, and cloud-native approaches to ensure your application can handle increased load.', 'one-next Team');