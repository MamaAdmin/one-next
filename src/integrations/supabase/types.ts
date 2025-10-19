export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author: string | null
          author_id: string | null
          canonical_url: string | null
          category_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          og_type: string | null
          published_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          robots_meta: string | null
          scheduled_publish_at: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          workflow_status: string | null
        }
        Insert: {
          author?: string | null
          author_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          og_type?: string | null
          published_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          robots_meta?: string | null
          scheduled_publish_at?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          workflow_status?: string | null
        }
        Update: {
          author?: string | null
          author_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          og_type?: string | null
          published_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          robots_meta?: string | null
          scheduled_publish_at?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          workflow_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_featured_image_fkey"
            columns: ["featured_image"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      bmad_artifacts: {
        Row: {
          agent_type: Database["public"]["Enums"]["bmad_agent_type"]
          artifact_type: Database["public"]["Enums"]["bmad_artifact_type"]
          content: string
          created_at: string
          id: string
          is_approved: boolean | null
          metadata: Json | null
          parent_artifact_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          session_id: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          agent_type: Database["public"]["Enums"]["bmad_agent_type"]
          artifact_type: Database["public"]["Enums"]["bmad_artifact_type"]
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          metadata?: Json | null
          parent_artifact_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          session_id: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["bmad_agent_type"]
          artifact_type?: Database["public"]["Enums"]["bmad_artifact_type"]
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          metadata?: Json | null
          parent_artifact_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          session_id?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "bmad_artifacts_parent_artifact_id_fkey"
            columns: ["parent_artifact_id"]
            isOneToOne: false
            referencedRelation: "bmad_artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bmad_artifacts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "bmad_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      bmad_conversations: {
        Row: {
          agent_type: Database["public"]["Enums"]["bmad_agent_type"]
          completion_tokens: number | null
          content: string
          created_at: string
          id: string
          prompt_tokens: number | null
          role: string
          session_id: string
        }
        Insert: {
          agent_type: Database["public"]["Enums"]["bmad_agent_type"]
          completion_tokens?: number | null
          content: string
          created_at?: string
          id?: string
          prompt_tokens?: number | null
          role: string
          session_id: string
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["bmad_agent_type"]
          completion_tokens?: number | null
          content?: string
          created_at?: string
          id?: string
          prompt_tokens?: number | null
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bmad_conversations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "bmad_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      bmad_sessions: {
        Row: {
          created_at: string
          created_by: string
          current_phase: string
          description: string | null
          development_started_at: string | null
          id: string
          planning_completed_at: string | null
          project_context: string | null
          settings: Json | null
          status: Database["public"]["Enums"]["bmad_session_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          current_phase?: string
          description?: string | null
          development_started_at?: string | null
          id?: string
          planning_completed_at?: string | null
          project_context?: string | null
          settings?: Json | null
          status?: Database["public"]["Enums"]["bmad_session_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_phase?: string
          description?: string | null
          development_started_at?: string | null
          id?: string
          planning_completed_at?: string | null
          project_context?: string | null
          settings?: Json | null
          status?: Database["public"]["Enums"]["bmad_session_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          change_summary: string | null
          changed_by: string | null
          content: Json
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          changed_by?: string | null
          content: Json
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          version_number: number
        }
        Update: {
          change_summary?: string | null
          changed_by?: string | null
          content?: Json
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          version_number?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          company_name: string | null
          company_size: string | null
          country: string | null
          created_at: string
          email: string
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          position: string | null
          primary_admin_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          company_size?: string | null
          country?: string | null
          created_at?: string
          email: string
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          position?: string | null
          primary_admin_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string | null
          company_size?: string | null
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          position?: string | null
          primary_admin_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      design_sprint_sessions: {
        Row: {
          achievements: Json | null
          challenge_data: Json | null
          completion_percentage: number | null
          created_at: string | null
          current_phase: number | null
          id: string
          last_active_phase: number | null
          session_token: string
          streak_days: number | null
          task_completion: Json | null
          team_name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          achievements?: Json | null
          challenge_data?: Json | null
          completion_percentage?: number | null
          created_at?: string | null
          current_phase?: number | null
          id?: string
          last_active_phase?: number | null
          session_token: string
          streak_days?: number | null
          task_completion?: Json | null
          team_name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievements?: Json | null
          challenge_data?: Json | null
          completion_percentage?: number | null
          created_at?: string | null
          current_phase?: number | null
          id?: string
          last_active_phase?: number | null
          session_token?: string
          streak_days?: number | null
          task_completion?: Json | null
          team_name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      faq_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      faq_feedback: {
        Row: {
          created_at: string | null
          expected_answer: string | null
          faq_id: string
          feedback_text: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          expected_answer?: string | null
          faq_id: string
          feedback_text?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          expected_answer?: string | null
          faq_id?: string
          feedback_text?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faq_feedback_faq_id_fkey"
            columns: ["faq_id"]
            isOneToOne: false
            referencedRelation: "faq_items"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_items: {
        Row: {
          answer: string
          category_id: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_published: boolean | null
          not_helpful_count: number | null
          question: string
          reviewed_at: string | null
          reviewed_by: string | null
          sort_order: number | null
          updated_at: string | null
          view_count: number | null
          workflow_status: string | null
        }
        Insert: {
          answer: string
          category_id?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          not_helpful_count?: number | null
          question: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          sort_order?: number | null
          updated_at?: string | null
          view_count?: number | null
          workflow_status?: string | null
        }
        Update: {
          answer?: string
          category_id?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          not_helpful_count?: number | null
          question?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          sort_order?: number | null
          updated_at?: string | null
          view_count?: number | null
          workflow_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "faq_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_achievements: {
        Row: {
          achievement_type: string
          id: string
          participant_id: string
          unlocked_at: string | null
        }
        Insert: {
          achievement_type: string
          id?: string
          participant_id: string
          unlocked_at?: string | null
        }
        Update: {
          achievement_type?: string
          id?: string
          participant_id?: string
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lms_achievements_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_activity_log: {
        Row: {
          activity_date: string
          activity_type: string
          created_at: string | null
          id: string
          participant_id: string
        }
        Insert: {
          activity_date: string
          activity_type: string
          created_at?: string | null
          id?: string
          participant_id: string
        }
        Update: {
          activity_date?: string
          activity_type?: string
          created_at?: string | null
          id?: string
          participant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_activity_log_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_artifacts: {
        Row: {
          created_at: string
          enrollment_id: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          module_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enrollment_id: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          module_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enrollment_id?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          module_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_artifacts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "lms_course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_artifacts_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "lms_course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_collaboration_sessions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          module_id: string
          purchase_id: string
          session_data: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          module_id: string
          purchase_id: string
          session_data?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          module_id?: string
          purchase_id?: string
          session_data?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_collaboration_sessions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "lms_course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_collaboration_sessions_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "lms_course_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_course_enrollments: {
        Row: {
          completed_at: string | null
          created_at: string
          current_category: string
          enrolled_at: string
          id: string
          participant_id: string
          progress_percentage: number
          purchase_id: string
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_category?: string
          enrolled_at?: string
          id?: string
          participant_id: string
          progress_percentage?: number
          purchase_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_category?: string
          enrolled_at?: string
          id?: string
          participant_id?: string
          progress_percentage?: number
          purchase_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_course_enrollments_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_course_enrollments_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "lms_course_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_course_modules: {
        Row: {
          author: string | null
          category: string
          content_text: string | null
          content_video_url: string | null
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_required: boolean
          module_type: string
          prerequisites: string[] | null
          resources: Json | null
          sort_order: number
          tags: string[] | null
          title: string
          tool_recommendation: string | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string
          content_text?: string | null
          content_video_url?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_required?: boolean
          module_type?: string
          prerequisites?: string[] | null
          resources?: Json | null
          sort_order: number
          tags?: string[] | null
          title: string
          tool_recommendation?: string | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string
          content_text?: string | null
          content_video_url?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_required?: boolean
          module_type?: string
          prerequisites?: string[] | null
          resources?: Json | null
          sort_order?: number
          tags?: string[] | null
          title?: string
          tool_recommendation?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_course_purchases: {
        Row: {
          course_id: string
          created_at: string
          customer_id: string
          id: string
          number_of_licenses: number
          purchased_at: string
          status: string
          total_price: number
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          customer_id: string
          id?: string
          number_of_licenses?: number
          purchased_at?: string
          status?: string
          total_price: number
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          number_of_licenses?: number
          purchased_at?: string
          status?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_course_purchases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_course_purchases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_course_purchases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_course_ratings: {
        Row: {
          course_id: string
          created_at: string
          enrollment_id: string
          id: string
          participant_id: string
          rating: number
          review_text: string | null
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          enrollment_id: string
          id?: string
          participant_id: string
          rating: number
          review_text?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          enrollment_id?: string
          id?: string
          participant_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_course_ratings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_course_ratings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_course_ratings_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "lms_course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_course_ratings_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_course_tools: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          is_required: boolean | null
          sort_order: number
          tool_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          sort_order?: number
          tool_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          sort_order?: number
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_course_tools_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_course_tools_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_course_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "lms_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_courses: {
        Row: {
          author_id: string | null
          categories: string[] | null
          completion_deadline_days: number | null
          course_type: string
          created_at: string
          description_html: string | null
          difficulty: string | null
          duration_days: number | null
          featured_image: string | null
          id: string
          includes_certificate: boolean | null
          intro_video: Json | null
          is_active: boolean
          language: string | null
          options: Json | null
          prerequisites: string | null
          price_chf: number | null
          pricing: Json | null
          rating: number | null
          rating_count: number | null
          slug: string | null
          tags: string[] | null
          timed_release_enabled: boolean | null
          title: string
          total_lessons: number | null
          total_quizzes: number | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          author_id?: string | null
          categories?: string[] | null
          completion_deadline_days?: number | null
          course_type?: string
          created_at?: string
          description_html?: string | null
          difficulty?: string | null
          duration_days?: number | null
          featured_image?: string | null
          id?: string
          includes_certificate?: boolean | null
          intro_video?: Json | null
          is_active?: boolean
          language?: string | null
          options?: Json | null
          prerequisites?: string | null
          price_chf?: number | null
          pricing?: Json | null
          rating?: number | null
          rating_count?: number | null
          slug?: string | null
          tags?: string[] | null
          timed_release_enabled?: boolean | null
          title: string
          total_lessons?: number | null
          total_quizzes?: number | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          author_id?: string | null
          categories?: string[] | null
          completion_deadline_days?: number | null
          course_type?: string
          created_at?: string
          description_html?: string | null
          difficulty?: string | null
          duration_days?: number | null
          featured_image?: string | null
          id?: string
          includes_certificate?: boolean | null
          intro_video?: Json | null
          is_active?: boolean
          language?: string | null
          options?: Json | null
          prerequisites?: string | null
          price_chf?: number | null
          pricing?: Json | null
          rating?: number | null
          rating_count?: number | null
          slug?: string | null
          tags?: string[] | null
          timed_release_enabled?: boolean | null
          title?: string
          total_lessons?: number | null
          total_quizzes?: number | null
          updated_at?: string
          visibility?: string | null
        }
        Relationships: []
      }
      lms_gdpr_consents: {
        Row: {
          consent_type: string
          created_at: string
          granted_at: string | null
          id: string
          is_granted: boolean
          participant_id: string
          revoked_at: string | null
          updated_at: string
        }
        Insert: {
          consent_type: string
          created_at?: string
          granted_at?: string | null
          id?: string
          is_granted?: boolean
          participant_id: string
          revoked_at?: string | null
          updated_at?: string
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted_at?: string | null
          id?: string
          is_granted?: boolean
          participant_id?: string
          revoked_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_gdpr_consents_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          enrollment_id: string
          id: string
          is_completed: boolean
          lesson_id: string
          started_at: string | null
          time_spent_minutes: number | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          enrollment_id: string
          id?: string
          is_completed?: boolean
          lesson_id: string
          started_at?: string | null
          time_spent_minutes?: number | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          enrollment_id?: string
          id?: string
          is_completed?: boolean
          lesson_id?: string
          started_at?: string | null
          time_spent_minutes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "lms_course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lms_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_lesson_tools: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          lesson_id: string
          sort_order: number
          tool_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          lesson_id: string
          sort_order?: number
          tool_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          lesson_id?: string
          sort_order?: number
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_lesson_tools_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lms_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_lesson_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "lms_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_lessons: {
        Row: {
          content_text: string | null
          content_video_url: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_locked: boolean | null
          is_required: boolean | null
          lesson_type: string
          module_id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          content_text?: string | null
          content_video_url?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_locked?: boolean | null
          is_required?: boolean | null
          lesson_type?: string
          module_id: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          content_text?: string | null
          content_video_url?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_locked?: boolean | null
          is_required?: boolean | null
          lesson_type?: string
          module_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "lms_course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_module_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          enrollment_id: string
          id: string
          is_completed: boolean
          module_id: string
          time_spent_minutes: number | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          enrollment_id: string
          id?: string
          is_completed?: boolean
          module_id: string
          time_spent_minutes?: number | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          enrollment_id?: string
          id?: string
          is_completed?: boolean
          module_id?: string
          time_spent_minutes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_module_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "lms_course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "lms_course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_module_tools: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          module_id: string
          sort_order: number
          tool_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          module_id: string
          sort_order?: number
          tool_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          module_id?: string
          sort_order?: number
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_module_tools_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "lms_course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_module_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "lms_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_tools: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          embed_code: string | null
          external_url: string | null
          id: string
          is_active: boolean | null
          slug: string
          sort_order: number
          tags: string[] | null
          template_data: Json | null
          thumbnail_url: string | null
          title: string
          tool_type: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          embed_code?: string | null
          external_url?: string | null
          id?: string
          is_active?: boolean | null
          slug: string
          sort_order?: number
          tags?: string[] | null
          template_data?: Json | null
          thumbnail_url?: string | null
          title: string
          tool_type?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          embed_code?: string | null
          external_url?: string | null
          id?: string
          is_active?: boolean | null
          slug?: string
          sort_order?: number
          tags?: string[] | null
          template_data?: Json | null
          thumbnail_url?: string | null
          title?: string
          tool_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lms_votes: {
        Row: {
          created_at: string
          id: string
          item_id: string
          participant_id: string
          session_id: string
          updated_at: string
          vote_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          participant_id: string
          session_id: string
          updated_at?: string
          vote_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          participant_id?: string
          session_id?: string
          updated_at?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "lms_votes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_votes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "lms_collaboration_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          file_path: string
          file_size: number | null
          file_type: string
          filename: string
          height: number | null
          id: string
          optimized_path: string | null
          thumbnail_path: string | null
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_path: string
          file_size?: number | null
          file_type: string
          filename: string
          height?: number | null
          id?: string
          optimized_path?: string | null
          thumbnail_path?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          filename?: string
          height?: number | null
          id?: string
          optimized_path?: string | null
          thumbnail_path?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      navigation_items: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          menu_id: string | null
          parent_id: string | null
          sort_order: number
          target: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          menu_id?: string | null
          parent_id?: string | null
          sort_order?: number
          target?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          menu_id?: string | null
          parent_id?: string | null
          sort_order?: number
          target?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "navigation_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_menus: {
        Row: {
          created_at: string | null
          id: string
          label: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          label: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      page_content: {
        Row: {
          canonical_url: string | null
          content: string
          content_type: string
          created_at: string
          id: string
          og_image: string | null
          page_name: string
          reviewed_at: string | null
          reviewed_by: string | null
          robots_meta: string | null
          section_name: string
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          updated_at: string
          workflow_status: string | null
        }
        Insert: {
          canonical_url?: string | null
          content: string
          content_type: string
          created_at?: string
          id?: string
          og_image?: string | null
          page_name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          robots_meta?: string | null
          section_name: string
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          updated_at?: string
          workflow_status?: string | null
        }
        Update: {
          canonical_url?: string | null
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          og_image?: string | null
          page_name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          robots_meta?: string | null
          section_name?: string
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          updated_at?: string
          workflow_status?: string | null
        }
        Relationships: []
      }
      page_templates: {
        Row: {
          canonical_url: string | null
          content: Json
          created_at: string | null
          id: string
          is_published: boolean | null
          layout_type: string
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          og_image: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          canonical_url?: string | null
          content?: Json
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          layout_type: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          canonical_url?: string | null
          content?: Json
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          layout_type?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      participants: {
        Row: {
          created_at: string
          customer_id: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          email: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_redirects: {
        Row: {
          created_at: string | null
          from_path: string
          id: string
          is_active: boolean | null
          redirect_type: number | null
          to_path: string
        }
        Insert: {
          created_at?: string | null
          from_path: string
          id?: string
          is_active?: boolean | null
          redirect_type?: number | null
          to_path: string
        }
        Update: {
          created_at?: string | null
          from_path?: string
          id?: string
          is_active?: boolean | null
          redirect_type?: number | null
          to_path?: string
        }
        Relationships: []
      }
      sprint_bookings: {
        Row: {
          booking_status: string | null
          challenge_description: string
          company: string | null
          consequences: string
          created_at: string
          decider_available: boolean | null
          email: string
          gates_ok: boolean | null
          id: string
          impact_scale: number | null
          name: string
          notes: string | null
          payment_id: string | null
          payment_status: string | null
          preferred_start_date: string | null
          price_chf: number
          recommended_sprint_type: string | null
          relevance_reason: string
          session_token: string | null
          sprint_suitability_score: number | null
          success_criteria: string
          target_audience: string[]
          team_size: number
          testable_in_5_days: string | null
          updated_at: string
          user_access_count: number | null
        }
        Insert: {
          booking_status?: string | null
          challenge_description: string
          company?: string | null
          consequences: string
          created_at?: string
          decider_available?: boolean | null
          email: string
          gates_ok?: boolean | null
          id?: string
          impact_scale?: number | null
          name: string
          notes?: string | null
          payment_id?: string | null
          payment_status?: string | null
          preferred_start_date?: string | null
          price_chf?: number
          recommended_sprint_type?: string | null
          relevance_reason: string
          session_token?: string | null
          sprint_suitability_score?: number | null
          success_criteria: string
          target_audience: string[]
          team_size?: number
          testable_in_5_days?: string | null
          updated_at?: string
          user_access_count?: number | null
        }
        Update: {
          booking_status?: string | null
          challenge_description?: string
          company?: string | null
          consequences?: string
          created_at?: string
          decider_available?: boolean | null
          email?: string
          gates_ok?: boolean | null
          id?: string
          impact_scale?: number | null
          name?: string
          notes?: string | null
          payment_id?: string | null
          payment_status?: string | null
          preferred_start_date?: string | null
          price_chf?: number
          recommended_sprint_type?: string | null
          relevance_reason?: string
          session_token?: string | null
          sprint_suitability_score?: number | null
          success_criteria?: string
          target_audience?: string[]
          team_size?: number
          testable_in_5_days?: string | null
          updated_at?: string
          user_access_count?: number | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          customer_id: string
          email: string
          expires_at: string
          full_name: string
          id: string
          invited_by: string
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          customer_id: string
          email: string
          expires_at?: string
          full_name: string
          id?: string
          invited_by: string
          status?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          customer_id?: string
          email?: string
          expires_at?: string
          full_name?: string
          id?: string
          invited_by?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workflow_comments: {
        Row: {
          comment: string
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          comment: string
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          comment?: string
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      lms_courses_with_stats: {
        Row: {
          author_avatar: string | null
          author_name: string | null
          completion_deadline_days: number | null
          course_type: string | null
          created_at: string | null
          description: string | null
          duration_days: number | null
          enrolled_students_count: number | null
          id: string | null
          includes_certificate: boolean | null
          is_active: boolean | null
          language: string | null
          module_count: number | null
          prerequisites: string | null
          price_chf: number | null
          rating: number | null
          rating_count: number | null
          skill_level: string | null
          thumbnail_url: string | null
          title: string | null
          total_lessons: number | null
          total_quizzes: number | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_enrollment_progress: {
        Args: { p_enrollment_id: string }
        Returns: undefined
      }
      calculate_streak: {
        Args: { p_participant_id: string }
        Returns: number
      }
      generate_unique_slug: {
        Args: { course_id?: string; course_title: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_faq_view: {
        Args: { faq_id: string }
        Returns: undefined
      }
      is_company_admin: {
        Args: { _customer_id: string; _user_id: string }
        Returns: boolean
      }
      record_faq_vote: {
        Args: { faq_id: string; is_helpful: boolean }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user" | "content_manager"
      bmad_agent_type:
        | "business_analyst"
        | "product_manager"
        | "ux_expert"
        | "product_owner"
        | "architect"
        | "scrum_master"
        | "developer"
        | "qa_tester"
        | "orchestrator"
      bmad_artifact_type:
        | "business_requirements"
        | "product_vision"
        | "ux_wireframes"
        | "user_stories"
        | "technical_architecture"
        | "sprint_plan"
        | "story_file"
        | "flattened_repo"
        | "test_plan"
        | "orchestration_log"
      bmad_session_status: "planning" | "development" | "completed" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "content_manager"],
      bmad_agent_type: [
        "business_analyst",
        "product_manager",
        "ux_expert",
        "product_owner",
        "architect",
        "scrum_master",
        "developer",
        "qa_tester",
        "orchestrator",
      ],
      bmad_artifact_type: [
        "business_requirements",
        "product_vision",
        "ux_wireframes",
        "user_stories",
        "technical_architecture",
        "sprint_plan",
        "story_file",
        "flattened_repo",
        "test_plan",
        "orchestration_log",
      ],
      bmad_session_status: ["planning", "development", "completed", "archived"],
    },
  },
} as const
