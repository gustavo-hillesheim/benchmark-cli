export type Fields<T> = {
    [K in keyof T]: T[K];
};
