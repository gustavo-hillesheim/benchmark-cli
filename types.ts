export type Fields<T> = {
    [K in keyof T]: T[K];
};

export interface Command<Arg, Options> {
    execute(arg: Arg, options: Options): Promise<void> | void;
}
