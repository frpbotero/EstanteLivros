import { useCallback } from "react";
import { toast } from "react-toastify";
import { Api } from "../API/api";
import { useLibrary } from "./LibraryContext";

export function useLoanActions() {
  const { reloadAll } = useLibrary();

  const run = useCallback(
    async (request) => {
      try {
        const data = await request;
        toast.success(data.message);
        await reloadAll();
        return true;
      } catch (error) {
        toast.error(error.message);
        return false;
      }
    },
    [reloadAll]
  );

  return {
    lend: (fields) => run(Api.bookings.create(fields)),
    approve: (booking, dueDate) =>
      run(Api.bookings.update(booking._id, { bookingStatus: "loan", dueDate })),
    giveBack: (booking) =>
      run(Api.bookings.update(booking._id, { bookingStatus: "devolution" })),
    decline: (booking) => run(Api.bookings.remove(booking._id)),
  };
}
