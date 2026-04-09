import { Upload } from "lucide-react";

type Props = {
  logoPreview: string | null;
  isEditMode: boolean;
  getRootProps: any;
  getInputProps: any;
  isDragActive: boolean;
};

export default function CompanyLogoSection({
  logoPreview,
  isEditMode,
  getRootProps,
  getInputProps,
  isDragActive,
}: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-28 h-28 rounded-lg border border-gray-200 bg-gray-50 flex-shrink-0 overflow-hidden">
          {logoPreview ? (
            <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No logo
            </div>
          )}
        </div>

        {isEditMode && (
          <div
            {...getRootProps()}
            className={`flex-1 border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition text-sm
              ${isDragActive ? "border-amber-500 bg-amber-50" : "border-gray-300 hover:border-amber-400"}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto mb-2 text-gray-400" size={20} />
            <p className="font-medium text-gray-700">
              {logoPreview ? "Change logo" : "Upload company logo"}
            </p>
            <p className="text-xs text-gray-500 mt-1.5">
              PNG, JPG • max 2 MB • 400×400 recommended
            </p>
          </div>
        )}
      </div>
    </div>
  );
}