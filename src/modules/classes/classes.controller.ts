import { Request, Response } from 'express';
import { getAllClasses, getClassById, createClass, updateClass, cancelClass, deleteClass } from './classes.service';
import { sendSuccess, sendError } from '../../utils/response.utils';

export const getClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trainer_id, date, page, limit } = req.query;
    const data = await getAllClasses({
      trainer_id: trainer_id as string,
      date:       date as string,
      page:       parseInt(page as string) || 1,
      limit:      parseInt(limit as string) || 20,
    });
    sendSuccess(res, data);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const getClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const cls = await getClassById(req.params.id);
    if (!cls) { sendError(res, 'Class not found', 404); return; }
    sendSuccess(res, cls);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const addClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const cls = await createClass(req.body);
    sendSuccess(res, cls, 'Class created', 201);
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const editClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const cls = await updateClass(req.params.id, req.body);
    if (!cls) { sendError(res, 'Class not found', 404); return; }
    sendSuccess(res, cls, 'Class updated');
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const cancelClassHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const cls = await cancelClass(req.params.id);
    if (!cls) { sendError(res, 'Class not found', 404); return; }
    sendSuccess(res, cls, 'Class cancelled');
  } catch (err: any) {
    sendError(res, err.message);
  }
};

export const removeClass = async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteClass(req.params.id);
    sendSuccess(res, null, 'Class deleted');
  } catch (err: any) {
    sendError(res, err.message);
  }
};