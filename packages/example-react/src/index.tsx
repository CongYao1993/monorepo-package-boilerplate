export interface ButtonProps {
  label: string
}

export function Button({ label }: ButtonProps) {
  return <button className="example-react-btn">{label}</button>
}
