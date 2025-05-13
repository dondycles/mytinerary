import { Pencil, Plus } from "lucide-react";
import { useRef } from "react";
import { Button } from "./ui/button";

export default function ImageInput({
  imgUri,
  onChange,
}: {
  imgUri: string | null | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const imgRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex aspect-video w-full items-center justify-center gap-2 overflow-hidden rounded-2xl outline outline-dashed">
      {imgUri ? (
        <div className="relative h-full w-full">
          <img src={imgUri} alt="Preview" className="z-10 h-full w-full object-cover" />
          <Button
            type="button"
            variant={"outline"}
            onClick={() => imgRef.current?.click()}
            className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full drop-shadow-2xl backdrop-blur-lg"
          >
            <Pencil />
            <p className="text-sm">Change image</p>
          </Button>
        </div>
      ) : (
        <Button
          className="rounded-full"
          type="button"
          variant={"outline"}
          onClick={() => imgRef.current?.click()}
        >
          <Plus />
          <p className="text-sm">Add image</p>
        </Button>
      )}
      <input
        ref={imgRef}
        className="hidden"
        type="file"
        accept="image/*"
        onChange={onChange}
      />
    </div>
  );
}
