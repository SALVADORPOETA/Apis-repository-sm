// src/components/EditSectionForm.tsx
import { darkTheme } from '@/styles/darkTheme'
import React, { useState } from 'react'

interface EditSectionFormProps {
  section: string
  onCancel: () => void
  onSave: (newName: string) => void
}

const EditSectionForm: React.FC<EditSectionFormProps> = ({
  section,
  onCancel,
  onSave,
}) => {
  const [newSectionName, setNewSectionName] = useState(section)

  const handleSave = () => {
    if (newSectionName.trim()) {
      onSave(newSectionName.trim())
    }
  }

  return (
    <div
      className={`fixed inset-0 ${darkTheme.colors.modalOverlay} flex items-center justify-center z-50`}
    >
      <div
        className={`${darkTheme.colors.card} ${darkTheme.spacing.modalPadding} ${darkTheme.rounded} ${darkTheme.shadow} max-w-sm w-full`}
      >
        <h3 className={`${darkTheme.colors.heading} text-xl font-bold mb-4`}>
          ✏️ Edit Section Name
        </h3>

        <input
          type="text"
          value={newSectionName}
          onChange={(e) => setNewSectionName(e.target.value)}
          className={`w-full ${darkTheme.input} ${darkTheme.colors.inputText} ${darkTheme.colors.inputBg} border ${darkTheme.colors.inputBorder} ${darkTheme.colors.inputFocusRing} mb-4`}
          placeholder="Enter new section name"
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className={`px-4 py-2 ${darkTheme.colors.buttonSecondary} ${darkTheme.rounded}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 ${darkTheme.colors.buttonPrimary} ${darkTheme.rounded}`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditSectionForm
