export interface ButtonProps {
  label: string
}

export function Button({ label }: ButtonProps) {
  return <button className="__PACKAGE_NAME__-btn">{label}</button>
}
