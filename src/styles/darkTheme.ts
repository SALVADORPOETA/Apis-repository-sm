export const darkTheme = {
  colors: {
    // Fondos
    background: 'bg-gray-900', // Fondo general
    card: 'bg-gray-800', // Tarjetas, modales
    modalOverlay: 'bg-black bg-opacity-50', // Overlay de modales

    // Textos
    text: 'text-gray-300', // Texto normal
    heading: 'text-indigo-500', // Encabezados y títulos
    label: 'text-gray-300', // Labels de formularios
    placeholder: 'placeholder-gray-400', // Placeholder inputs

    // Inputs / Textarea
    inputBg: 'bg-gray-700',
    inputText: 'text-gray-300',
    inputBorder: 'border-gray-600',
    inputFocusRing:
      'focus:ring-indigo-500 focus:border-indigo-500 outline-none',

    // Botones
    buttonPrimary:
      'bg-indigo-600 text-white hover:bg-indigo-700 disabled:hover:bg-indigo-600 cursor-pointer disabled:cursor-auto',
    buttonSecondary:
      'bg-gray-700 text-gray-300 hover:bg-gray-600 cursor-pointer',
    buttonWarning:
      'bg-yellow-600 text-gray-900 hover:bg-yellow-500 cursor-pointer',
    buttonDanger:
      'bg-red-600 text-gray-200 hover:bg-red-500 disabled:hover:bg-red-600 cursor-pointer disabled:cursor-auto',
    buttonExtra:
      'bg-yellow-300 text-gray-900 hover:bg-yellow-400 cursor-pointer',
    buttonInfo: 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer',

    // Mensajes
    errorBg: 'bg-red-900',
    errorBorder: 'border-red-500',
    errorText: 'text-red-400',
    successBg: 'bg-green-800',
    successText: 'text-green-300',
  },
  spacing: {
    cardPadding: 'p-6',
    modalPadding: 'p-6',
    gap: 'gap-4',
  },
  rounded: 'rounded-lg',
  shadow: 'shadow-2xl',
  input: 'rounded-md p-2',
}
