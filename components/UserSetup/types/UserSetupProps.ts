export interface UserSetupProps {
    onCreate: (name: string, email: string) => Promise<void>;
}
