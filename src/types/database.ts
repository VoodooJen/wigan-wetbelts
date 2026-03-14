export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string;
          make: string;
          model: string;
          engine: string;
          year_from: number | null;
          year_to: number | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["vehicles"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vehicles"]["Insert"]>;
      };
      job_types: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["job_types"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["job_types"]["Insert"]>;
      };
      vehicle_services: {
        Row: {
          id: string;
          vehicle_id: string;
          job_type_id: string;
          price_gbp: number;
          duration_hours: number;
          downtime_label: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["vehicle_services"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vehicle_services"]["Insert"]>;
      };
      customers: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["customers"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          vehicle_service_id: string;
          vehicle_id: string;
          job_type_id: string;
          booking_date: string;
          preferred_start_time: string | null;
          status: "pending_payment" | "confirmed" | "in_progress" | "waiting_parts" | "completed" | "cancelled";
          price_gbp: number;
          booking_fee_paid_gbp: number;
          remaining_balance_gbp: number;
          payment_status: "pending" | "booking_fee_paid" | "fully_paid" | "refunded" | "cancelled";
          duration_hours: number;
          downtime_label: string;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          tracking_token: string;
          reg_number: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bookings"]["Row"], "id" | "created_at" | "tracking_token"> & {
          id?: string;
          tracking_token?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      booking_allocations: {
        Row: {
          id: string;
          booking_id: string;
          allocation_date: string;
          hours_allocated: number;
          sequence_no: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["booking_allocations"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["booking_allocations"]["Insert"]>;
      };
      booking_holds: {
        Row: {
          id: string;
          vehicle_service_id: string;
          preferred_start_date: string;
          preferred_start_time: string;
          allocations_json: Json;
          expires_at: string;
          status: "active" | "converted" | "expired" | "cancelled";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["booking_holds"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["booking_holds"]["Insert"]>;
      };
      booking_updates: {
        Row: {
          id: string;
          booking_id: string;
          title: string;
          body: string;
          is_customer_visible: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["booking_updates"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["booking_updates"]["Insert"]>;
      };
      booking_media: {
        Row: {
          id: string;
          booking_id: string;
          storage_path: string;
          media_type: "image" | "video";
          caption: string | null;
          is_customer_visible: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["booking_media"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["booking_media"]["Insert"]>;
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string | null;
          customer_name: string;
          rating: number;
          body: string;
          is_approved: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at" | "is_approved"> & {
          id?: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
      business_settings: {
        Row: {
          id: string;
          workshop_daily_capacity_hours: number;
          working_days: number[];
          business_name: string;
          phone: string | null;
          email: string | null;
          stripe_success_url: string | null;
          stripe_cancel_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["business_settings"]["Row"], "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["business_settings"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: "admin" | "staff";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at"> & {
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
    };
  };
};
