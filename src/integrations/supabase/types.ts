export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          link_label: string | null;
          link_url: string | null;
          pinned: boolean;
          published: boolean;
          published_at: string;
          title: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          link_label?: string | null;
          link_url?: string | null;
          pinned?: boolean;
          published?: boolean;
          published_at?: string;
          title: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          link_label?: string | null;
          link_url?: string | null;
          pinned?: boolean;
          published?: boolean;
          published_at?: string;
          title?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          company: string | null;
          created_at: string;
          email: string;
          id: string;
          metadata: Json;
          name: string | null;
          source: string;
          user_agent: string | null;
        };
        Insert: {
          company?: string | null;
          created_at?: string;
          email: string;
          id?: string;
          metadata?: Json;
          name?: string | null;
          source: string;
          user_agent?: string | null;
        };
        Update: {
          company?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          metadata?: Json;
          name?: string | null;
          source?: string;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      members: {
        Row: {
          current_period_end: string | null;
          id: string;
          is_comped: boolean;
          is_founding: boolean;
          joined_at: string;
          plan: string | null;
          status: Database["public"]["Enums"]["subscription_status"];
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          current_period_end?: string | null;
          id?: string;
          is_comped?: boolean;
          is_founding?: boolean;
          joined_at?: string;
          plan?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          current_period_end?: string | null;
          id?: string;
          is_comped?: boolean;
          is_founding?: boolean;
          joined_at?: string;
          plan?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      pending_claims: {
        Row: {
          claimed_at: string | null;
          claimed_by: string | null;
          created_at: string;
          current_period_end: string | null;
          email: string;
          id: string;
          price_id: string | null;
          status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
        };
        Insert: {
          claimed_at?: string | null;
          claimed_by?: string | null;
          created_at?: string;
          current_period_end?: string | null;
          email: string;
          id?: string;
          price_id?: string | null;
          status: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
        };
        Update: {
          claimed_at?: string | null;
          claimed_by?: string | null;
          created_at?: string;
          current_period_end?: string | null;
          email?: string;
          id?: string;
          price_id?: string | null;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          company: string | null;
          created_at: string;
          display_name: string | null;
          headline: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          company?: string | null;
          created_at?: string;
          display_name?: string | null;
          headline?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          company?: string | null;
          created_at?: string;
          display_name?: string | null;
          headline?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      replays: {
        Row: {
          created_at: string;
          description: string | null;
          duration_minutes: number | null;
          id: string;
          published: boolean;
          recorded_at: string;
          tags: string[];
          thumbnail_url: string | null;
          title: string;
          video_url: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          duration_minutes?: number | null;
          id?: string;
          published?: boolean;
          recorded_at?: string;
          tags?: string[];
          thumbnail_url?: string | null;
          title: string;
          video_url?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          duration_minutes?: number | null;
          id?: string;
          published?: boolean;
          recorded_at?: string;
          tags?: string[];
          thumbnail_url?: string | null;
          title?: string;
          video_url?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean;
          created_at: string;
          current_period_end: string | null;
          environment: string;
          id: string;
          metadata: Json;
          price_id: string | null;
          product_id: string | null;
          status: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end?: string | null;
          environment?: string;
          id?: string;
          metadata?: Json;
          price_id?: string | null;
          product_id?: string | null;
          status: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end?: string | null;
          environment?: string;
          id?: string;
          metadata?: Json;
          price_id?: string | null;
          product_id?: string | null;
          status?: string;
          stripe_customer_id?: string;
          stripe_subscription_id?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      templates: {
        Row: {
          badge: string | null;
          category: Database["public"]["Enums"]["template_category"];
          created_at: string;
          description: string;
          download_url: string | null;
          featured: boolean;
          file_type: string;
          highlights: string[];
          id: string;
          long_description: string | null;
          pages: string | null;
          published: boolean;
          title: string;
        };
        Insert: {
          badge?: string | null;
          category: Database["public"]["Enums"]["template_category"];
          created_at?: string;
          description: string;
          download_url?: string | null;
          featured?: boolean;
          file_type?: string;
          highlights?: string[];
          id?: string;
          long_description?: string | null;
          pages?: string | null;
          published?: boolean;
          title: string;
        };
        Update: {
          badge?: string | null;
          category?: Database["public"]["Enums"]["template_category"];
          created_at?: string;
          description?: string;
          download_url?: string | null;
          featured?: boolean;
          file_type?: string;
          highlights?: string[];
          id?: string;
          long_description?: string | null;
          pages?: string | null;
          published?: boolean;
          title?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_active_subscription: { Args: { _user_id: string }; Returns: boolean };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "member" | "beta";
      subscription_status: "trialing" | "active" | "past_due" | "canceled" | "incomplete";
      template_category:
        | "proposals"
        | "contracts"
        | "sales"
        | "operations"
        | "finance"
        | "estimating"
        | "contractor_circle";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "member", "beta"],
      subscription_status: ["trialing", "active", "past_due", "canceled", "incomplete"],
      template_category: [
        "proposals",
        "contracts",
        "sales",
        "operations",
        "finance",
        "estimating",
        "contractor_circle",
      ],
    },
  },
} as const;
