import { supabase } from '@/lib/supabase';
import { Address } from '@/types/marketplace';

export const addressService = {
  /**
   * Get all addresses for a user
   */
  async getUserAddresses(userId: string): Promise<Address[]> {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false });

      if (error) {
        console.error("Error fetching user addresses:", error);
        throw new Error(error.message);
      }

      return data as Address[];
    } catch (error) {
      console.error("Error in getUserAddresses:", error);
      throw error;
    }
  },

  /**
   * Get a single address by ID
   */
  async getAddressById(addressId: string): Promise<Address> {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("id", addressId)
        .single();

      if (error) {
        console.error(`Error fetching address ${addressId}:`, error);
        throw new Error(error.message);
      }

      return data as Address;
    } catch (error) {
      console.error("Error in getAddressById:", error);
      throw error;
    }
  },

  /**
   * Create a new address
   */
  async createAddress(address: AddressInput): Promise<Address> {
    try {
      // Check if this is the first address - if so, make it default
      const { data: existingAddresses, error: countError } = await supabase
        .from("addresses")
        .select("id")
        .eq("user_id", address.user_id);

      if (countError) {
        console.error("Error checking existing addresses:", countError);
        throw new Error(countError.message);
      }

      // If this is the first address or if is_default is explicitly set to true, 
      // handle the default address logic
      const isFirstAddress = existingAddresses.length === 0;
      const shouldBeDefault = address.is_default || isFirstAddress;

      // If this should be default, unset any existing default addresses
      if (shouldBeDefault && !isFirstAddress) {
        const { error: updateError } = await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", address.user_id)
          .eq("is_default", true);

        if (updateError) {
          console.error("Error updating existing default addresses:", updateError);
          throw new Error(updateError.message);
        }
      }

      // Create the new address
      const newAddress = {
        ...address,
        is_default: shouldBeDefault
      };

      const { data, error } = await supabase
        .from("addresses")
        .insert([newAddress])
        .select()
        .single();

      if (error) {
        console.error("Error creating address:", error);
        throw new Error(error.message);
      }

      return data as Address;
    } catch (error) {
      console.error("Error in createAddress:", error);
      throw error;
    }
  },

  /**
   * Update an existing address
   */
  async updateAddress(
    addressId: string, 
    addressData: Partial<AddressInput>
  ): Promise<Address> {
    try {
      // Check if we're setting this address as default
      if (addressData.is_default) {
        const { data: currentAddress, error: fetchError } = await supabase
          .from("addresses")
          .select("user_id")
          .eq("id", addressId)
          .single();

        if (fetchError) {
          console.error(`Error fetching address ${addressId}:`, fetchError);
          throw new Error(fetchError.message);
        }

        // Reset any existing default addresses for this user
        const { error: updateError } = await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", currentAddress.user_id)
          .eq("is_default", true);

        if (updateError) {
          console.error("Error updating existing default addresses:", updateError);
          throw new Error(updateError.message);
        }
      }

      // Update the address
      const { data, error } = await supabase
        .from("addresses")
        .update(addressData)
        .eq("id", addressId)
        .select()
        .single();

      if (error) {
        console.error(`Error updating address ${addressId}:`, error);
        throw new Error(error.message);
      }

      return data as Address;
    } catch (error) {
      console.error("Error in updateAddress:", error);
      throw error;
    }
  },

  /**
   * Delete an address
   */
  async deleteAddress(addressId: string): Promise<void> {
    try {
      // Check if this is a default address
      const { data: addressToDelete, error: fetchError } = await supabase
        .from("addresses")
        .select("*")
        .eq("id", addressId)
        .single();

      if (fetchError) {
        console.error(`Error fetching address ${addressId}:`, fetchError);
        throw new Error(fetchError.message);
      }

      // Delete the address
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", addressId);

      if (error) {
        console.error(`Error deleting address ${addressId}:`, error);
        throw new Error(error.message);
      }

      // If this was a default address, set another address as default
      if (addressToDelete.is_default) {
        const { data: remainingAddresses, error: selectError } = await supabase
          .from("addresses")
          .select("id")
          .eq("user_id", addressToDelete.user_id)
          .limit(1);

        if (selectError) {
          console.error("Error selecting remaining addresses:", selectError);
          throw new Error(selectError.message);
        }

        // If there are any remaining addresses, make the first one default
        if (remainingAddresses && remainingAddresses.length > 0) {
          const { error: updateError } = await supabase
            .from("addresses")
            .update({ is_default: true })
            .eq("id", remainingAddresses[0].id);

          if (updateError) {
            console.error("Error setting new default address:", updateError);
            throw new Error(updateError.message);
          }
        }
      }
    } catch (error) {
      console.error("Error in deleteAddress:", error);
      throw error;
    }
  },

  /**
   * Set an address as default
   */
  async setDefaultAddress(addressId: string): Promise<Address> {
    try {
      // Get the user ID for this address
      const { data: address, error: fetchError } = await supabase
        .from("addresses")
        .select("user_id")
        .eq("id", addressId)
        .single();

      if (fetchError) {
        console.error(`Error fetching address ${addressId}:`, fetchError);
        throw new Error(fetchError.message);
      }

      // Unset any existing default addresses
      const { error: updateError } = await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", address.user_id)
        .eq("is_default", true);

      if (updateError) {
        console.error("Error updating existing default addresses:", updateError);
        throw new Error(updateError.message);
      }

      // Set this address as default
      const { data, error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", addressId)
        .select()
        .single();

      if (error) {
        console.error(`Error setting address ${addressId} as default:`, error);
        throw new Error(error.message);
      }

      return data as Address;
    } catch (error) {
      console.error("Error in setDefaultAddress:", error);
      throw error;
    }
  },

  /**
   * Get the default address for a user
   */
  async getDefaultAddress(userId: string): Promise<Address | null> {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .eq("is_default", true)
        .single();

      if (error) {
        // If no default address is found, it's not an error
        if (error.code === "PGRST116") {
          return null;
        }
        console.error(`Error fetching default address for user ${userId}:`, error);
        throw new Error(error.message);
      }

      return data as Address;
    } catch (error) {
      console.error("Error in getDefaultAddress:", error);
      throw error;
    }
  }
}; 