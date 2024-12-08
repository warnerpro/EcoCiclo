import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ConfirmDialog({
  confirmationData,
  submitAddress,
  setConfirmationData,
}: {
  confirmationData: {
    name: string;
    latitude: number;
    longitude: number;
  } | null;
  submitAddress: (data: {
    name: string;
    latitude: number;
    longitude: number;
  }) => Promise<void>;
  setConfirmationData: (data: null) => void;
}) {
  return (
    <Dialog
      open={!!confirmationData}
      onOpenChange={() => setConfirmationData(null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirme o endereço</DialogTitle>
        </DialogHeader>
        <div>
          <p className="font-bold">{confirmationData?.name}</p>
          <div className="mt-4 flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setConfirmationData(null)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (confirmationData) {
                  submitAddress(confirmationData);
                  setConfirmationData(null);
                }
              }}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
