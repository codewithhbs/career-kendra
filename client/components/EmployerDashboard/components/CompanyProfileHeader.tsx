import { Building2, Edit, Save, X, Loader2 } from "lucide-react";

type Props = {
  companyName?: string;
  isEditMode: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
};

export default function CompanyProfileHeader({
  companyName,
  isEditMode,
  onEdit,
  onSave,
  onCancel,
  isSaving,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      
      {/* Left Section */}
      <div className="flex items-start sm:items-center gap-4">
        
        {/* Icon Container */}
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-amber-50">
          <Building2 className="text-amber-600" size={24} />
        </div>

        {/* Title & Subtitle */}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Company Profile
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            {companyName ? (
              <>
                Managing profile for{" "}
                <span className="font-medium text-gray-800">
                  {companyName}
                </span>
              </>
            ) : (
              "Add your company information to complete your profile."
            )}
          </p>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex flex-wrap items-center gap-3">

        {!isEditMode ? (
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            <Edit size={16} />
            Edit Profile
          </button>
        ) : (
          <>
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition"
            >
              <X size={16} />
              Cancel
            </button>

            <button
              onClick={onSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}